import { httpResource } from '@angular/common/http';
import { Component, DestroyRef, effect, inject, linkedSignal, type OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import type { AssetsInfoResponseType } from '@api-spec/shared/assets.schema';
import type { ActiveElement, ChartData } from 'chart.js';
import { interval } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { AuthService } from '../../shared/services/auth.service';
import { AssetDetailsTableComponent } from './components/asset-details-table/asset-details-table.component';
import { AssetSummaryCardComponent } from './components/asset-summary-card/asset-summary-card.component';
import { AssetsBarChartComponent } from './components/assets-bar-chart/assets-bar-chart.component';
import { ChartPeriodToggleComponent } from './components/chart-period-toggle/chart-period-toggle.component';

export type PeriodType = '月次' | '年次';

@Component({
  selector: 'app-home',
  imports: [
    HeaderComponent,
    AssetSummaryCardComponent,
    ChartPeriodToggleComponent,
    AssetsBarChartComponent,
    AssetDetailsTableComponent,
  ],
  template: `
    <app-header />

    <main class="max-w-5xl mx-auto p-6 bg-slate-50 min-h-[calc(100svh-89px)]">
      <div class="flex flex-col gap-6">
        <!-- 選択月の資産合計のカード -->
        <app-asset-summary-card [assetInfo]="currentAssetInfo()" />

        <!-- 月次/年次の切り替えボタン -->
        <app-chart-period-toggle [periodType]="selectedPeriodType()" (changePeriodType)="changePeriodType($event)" />

        <!-- 資産内訳の棒グラフ -->
        <app-assets-bar-chart [barChartData]="barChartData" (updateCurrentAssetInfo)="updateCurrentAssetInfo($event)" />

        <!-- 資産内訳のテーブル -->
        <app-asset-details-table [assetInfo]="currentAssetInfo()" />
      </div>
    </main>
  `,
})
export default class HomeComponent implements OnInit {
  private readonly API_BASE_URL = environment.API_BASE_URL;
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  private readonly monthlyAssetsInfo = httpResource<AssetsInfoResponseType[]>(() => ({
    url: `${this.API_BASE_URL}/assets/monthly?baseDate=${this.getToday()}`,
    method: 'GET',
    credentials: 'include',
  }));
  private readonly yearlyAssetsInfo = httpResource<AssetsInfoResponseType[]>(() => ({
    url: `${this.API_BASE_URL}/assets/yearly?baseDate=${this.getToday()}`,
    method: 'GET',
    credentials: 'include',
  }));

  selectedPeriodType = signal<PeriodType>('月次');
  currentAssetInfo = linkedSignal(() => {
    const selectedPeriod = this.selectedPeriodType();
    const assetsInfo = selectedPeriod === '月次' ? this.monthlyAssetsInfo : this.yearlyAssetsInfo;

    return assetsInfo.value()?.at(-1);
  });

  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [],
  };

  constructor() {
    effect(() => {
      const monthlyAssets = this.monthlyAssetsInfo;
      if (monthlyAssets.hasValue()) {
        this.convertToBarChartData(monthlyAssets.value(), '月次');
      }
    });
  }

  ngOnInit(): void {
    interval(60000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.verifyAuth());
  }

  /**
   * ログインの有効状態を検証する。無効なら`/login`にリダイレクトさせる
   */
  private async verifyAuth(): Promise<void> {
    const isLogin = await this.authService.authCheck();

    if (!isLogin) {
      await this.router.navigateByUrl('/login');
      alert('ログイン有効期限が切れました。ログインし直してください');
    }
  }

  /**
   * 本日の日付を返す
   * @returns 本日の日付（yyyy-mm-dd）
   */
  private getToday() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const date = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${date}`;
  }

  /**
   * 期間（月次/年次）タイプを変更する
   * @param type 期間タイプ
   */
  changePeriodType(type: PeriodType): void {
    this.selectedPeriodType.set(type);

    const assetsInfo = type === '月次' ? this.monthlyAssetsInfo : this.yearlyAssetsInfo;
    if (assetsInfo.hasValue()) {
      this.convertToBarChartData(assetsInfo.value(), type);
    }
  }

  /**
   * 現在の資産情報を更新する
   * @param { active } クリックした棒グラフのグラフ情報
   */
  updateCurrentAssetInfo({ active }: { active?: object[] }): void {
    const clickedChartIndex = (active as ActiveElement[])[0]?.index;
    if (clickedChartIndex === undefined) return;

    const assetsInfo = this.selectedPeriodType() === '月次' ? this.monthlyAssetsInfo : this.yearlyAssetsInfo;
    const assetIndex = this.selectedPeriodType() === '月次' ? clickedChartIndex + 1 : clickedChartIndex; // 月次の場合は資産情報配列を13 -> 12にいじっているため、+1をして調整
    const currentAssetInfo = assetsInfo.value()?.[assetIndex];

    this.currentAssetInfo.set(currentAssetInfo);
  }

  /**
   * 棒グラフ描画用のデータに変換する
   * @param assetsInfo 資産情報の配列
   * @param periodType 期間タイプ
   */
  private convertToBarChartData(assetsInfo: AssetsInfoResponseType[], periodType: PeriodType): void {
    const chartData = periodType === '月次' ? assetsInfo.slice(1) : assetsInfo; // 月次の場合のみ先頭を除外（棒グラフには12件のみ表示する）

    const labels = chartData.map((item) => {
      const [year, month] = item.yearMonth.split('-');
      return `${year?.slice(2)}/${month}`;
    });
    const categories = [
      ...new Set(chartData.flatMap((item) => item.assetsByCategories.map((asset) => asset.category))),
    ];

    const datasets = categories.map((category) => {
      const data = chartData.map((item) => {
        const asset = item.assetsByCategories.find((asset) => asset.category === category);
        return asset ? asset.amount : 0;
      });
      return {
        data,
        label: category,
      };
    });

    this.barChartData = {
      labels,
      datasets,
    };
  }
}
