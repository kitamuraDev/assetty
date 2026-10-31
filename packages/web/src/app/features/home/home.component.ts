import { httpResource } from '@angular/common/http';
import { Component, computed, DestroyRef, inject, linkedSignal, type OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import type { AssetInfoResponseType } from '@api-spec/api-types';
import type { ChartData } from 'chart.js';
import { interval } from 'rxjs';

import { environment } from '../../../environments/environment';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { AuthService } from '../../shared/services/auth.service';
import { DateService } from '../../shared/services/date.service';
import { AssetDetailsTableComponent } from './components/asset-details-table.component';
import { AssetSummaryCardComponent } from './components/asset-summary-card.component';
import { AssetsBarChartComponent } from './components/assets-bar-chart.component';
import { ChartPeriodToggleComponent } from './components/chart-period-toggle.component';
import { HomeStatusCardComponent } from './components/home-status-card.component';
import type { AssetsDataAvailability, PeriodType } from './home.types';

@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    HeaderComponent,
    AssetSummaryCardComponent,
    ChartPeriodToggleComponent,
    AssetsBarChartComponent,
    AssetDetailsTableComponent,
    HomeStatusCardComponent,
  ],
  template: `
    <app-header />

    <main class="max-w-5xl mx-auto p-6 bg-slate-50 min-h-[calc(100svh-89px)]">
      @let availability = assetsDataAvailability();
      @switch (availability) {
        @case ('error') {
          <app-home-status-card
            title="資産情報の読み込み失敗"
            message="資産情報を読み込めませんでした。時間をおいて再度お試しください。"
          >
            <button
              type="button"
              (click)="monthlyAssetsInfo.reload(); yearlyAssetsInfo.reload()"
              class="inline-flex justify-center items-center gap-2 px-5 py-3 rounded-lg bg-black text-white cursor-pointer hover:opacity-70 transition-opacity"
            >
              再読み込み
            </button>
          </app-home-status-card>
        }
        @case ('loading') {
          <app-home-status-card
            title="資産情報を読み込み中です"
            message="資産情報を取得しています。しばらくお待ちください。"
          />
        }
        @case ('none') {
          <app-home-status-card
            title="資産情報が未登録です"
            message="資産情報を登録すると、資産の推移や内訳を確認できるようになります。まずは現在の資産情報を登録しましょう。"
          >
            <a
              routerLink="/register/assets"
              class="inline-flex justify-center items-center gap-2 px-5 py-3 rounded-lg bg-black text-white cursor-pointer hover:opacity-70 transition-opacity"
            >
              資産情報を登録する
            </a>
          </app-home-status-card>
        }
        @case ('both')
        @case ('monthly-only')
        @case ('yearly-only') {
          <div class="flex flex-col gap-6">
            <!-- 選択月の資産合計のカード -->
            <app-asset-summary-card [assetInfo]="currentAssetInfo()" />
            <!-- 月次/年次の切り替えボタン -->
            <app-chart-period-toggle [(periodType)]="selectedPeriodType" [assetsDataAvailability]="assetsDataAvailability()" />
            <!-- 資産内訳の棒グラフ -->
            <app-assets-bar-chart [barChartData]="barChartData()" (selectedIndex)="updateCurrentAssetInfo($event)" />
            <!-- 資産内訳のテーブル -->
            <app-asset-details-table [assetInfo]="currentAssetInfo()" />
          </div>
        }
        @default never;
      }
    </main>
  `,
})
export default class HomeComponent implements OnInit {
  private readonly API_BASE_URL = environment.API_BASE_URL;
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private readonly dateService = inject(DateService);

  protected readonly monthlyAssetsInfo = httpResource<AssetInfoResponseType[]>(() => ({
    url: `${this.API_BASE_URL}/assets?base_date=${this.dateService.getToday()}&months_ago=12&year_end_only=false`,
    method: 'GET',
    credentials: 'include',
  }));
  protected readonly yearlyAssetsInfo = httpResource<AssetInfoResponseType[]>(() => ({
    url: `${this.API_BASE_URL}/assets?base_date=${this.dateService.getToday()}&months_ago=60&year_end_only=true`,
    method: 'GET',
    credentials: 'include',
  }));

  readonly assetsDataAvailability = computed<AssetsDataAvailability>(() => {
    if (this.monthlyAssetsInfo.error() || this.yearlyAssetsInfo.error()) return 'error';
    if (this.monthlyAssetsInfo.isLoading() || this.yearlyAssetsInfo.isLoading()) return 'loading';

    if (this.monthlyAssetsInfo.hasValue() && this.yearlyAssetsInfo.hasValue()) {
      const hasMonthly = this.monthlyAssetsInfo.value().length > 0;
      const hasYearly = this.yearlyAssetsInfo.value().length > 0;

      if (hasMonthly && hasYearly) return 'both';
      if (hasMonthly) return 'monthly-only';
      if (hasYearly) return 'yearly-only';

      return 'none';
    }

    // hasValue() === false は「配列が空」ではなく、「まだ値がない」状態のため、loadingを返す
    return 'loading';
  });

  readonly selectedPeriodType = linkedSignal<AssetsDataAvailability, PeriodType>({
    source: this.assetsDataAvailability,
    computation: (availability) => (availability === 'yearly-only' ? '年次' : '月次'),
  });

  private readonly selectedAssetsInfo = computed(() => {
    const selectedPeriod = this.selectedPeriodType();
    return selectedPeriod === '月次' ? this.monthlyAssetsInfo : this.yearlyAssetsInfo;
  });

  readonly currentAssetInfo = linkedSignal({
    source: this.selectedAssetsInfo,
    computation: (assetsInfo) => assetsInfo.value()?.at(-1),
  });

  readonly barChartData = computed<ChartData<'bar'>>(() => {
    const assetsInfo = this.selectedAssetsInfo();
    return assetsInfo.hasValue() ? this.convertToBarChartData(assetsInfo.value()) : { labels: [], datasets: [] };
  });

  ngOnInit(): void {
    // 1分ごとに認証状態を確認し、認証の有効期限が切れていたらログインページへ遷移させる
    interval(60000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.authService.verifyAuth());
  }

  /**
   * 現在の資産情報を更新する
   * @param index 選択した棒グラフのインデックス
   */
  updateCurrentAssetInfo(index: number): void {
    const assetsInfo = this.selectedAssetsInfo();
    const currentAssetInfo = assetsInfo.value()?.[index];

    this.currentAssetInfo.set(currentAssetInfo);
  }

  /**
   * 棒グラフ描画用のデータに変換して返す
   * @param assetsInfo 資産情報の配列
   * @returns 棒グラフ描画用データ
   */
  private convertToBarChartData(assetsInfo: AssetInfoResponseType[]): ChartData<'bar'> {
    const labels = assetsInfo.map((item) => {
      const [year, month] = item.yearMonth.split('-');
      return `${year?.slice(2)}/${month}`;
    });
    const categories = [
      ...new Set(assetsInfo.flatMap((item) => item.assetsByCategories.map((asset) => asset.category))),
    ];

    const datasets = categories.map((category) => {
      const data = assetsInfo.map((item) => {
        const asset = item.assetsByCategories.find((asset) => asset.category === category);
        return asset ? asset.amount : 0;
      });
      return {
        data,
        label: category,
      };
    });

    return { labels, datasets };
  }
}
