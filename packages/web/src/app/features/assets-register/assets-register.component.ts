import { DatePipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { Component, computed, DestroyRef, inject, linkedSignal, type OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import type { AssetsCategoryType, AssetsInfoResponseType } from '@api-spec/shared/assets.schema';
import { interval } from 'rxjs';

import { environment } from '../../../environments/environment';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { AssetsService } from '../../shared/services/assets.service';
import { AuthService } from '../../shared/services/auth.service';
import { DateService } from '../../shared/services/date.service';

@Component({
  selector: 'app-assets-register',
  imports: [DatePipe, FormsModule, HeaderComponent],
  template: `
    <app-header />

    <main class="max-w-5xl mx-auto p-6 bg-slate-50 min-h-[calc(100svh-89px)]">
      <h2 class="text-xl font-semibold mt-2 mb-4">資産情報登録</h2>
      <form class="flex flex-col gap-6 p-6">

        <!-- 年月 -->
        <section>
          <label class="flex flex-col gap-1">
            <span class="text-sm font-medium text-gray-900">年月</span>

            <select
              name="年月選択"
              [(ngModel)]="selectedYearMonth"
              class="text-xs p-2 rounded-md border border-slate-300 text-gray-700"
            >
              @for (month of past13YearMonths; track $index) {
                <option [value]="month">{{ month | date: 'yyyy年MM月' }}</option>
              }
            </select>
          </label>
        </section>

        <!-- 資産カテゴリ -->
        <section>
          <label class="flex flex-col gap-1">
            <span class="text-sm font-medium text-gray-900">資産カテゴリ</span>

            <select
              multiple
              size="1"
              name="資産カテゴリ選択"
              [(ngModel)]="selectedAssetCategories"
              class="text-xs p-2 rounded-md border border-slate-300 text-gray-700"
            >
              @for (assetCategory of assetCategoriesWithStatus(); track $index) {
                <option [value]="{id: assetCategory.id, name: assetCategory.name}" [disabled]="assetCategory.disabled">
                  {{ assetCategory.name }}
                </option>
              }
            </select>
          </label>
        </section>

        <!-- 金額 -->
        <section class="flex flex-col gap-2 mt-3">
          @for (acWithAmount of selectedAssetCategoriesWithAmount(); track $index) {
            <label class="flex flex-col gap-1">
              <span class="text-sm font-medium text-gray-900">{{ acWithAmount.name }}</span>

              <input
                type="number"
                inputmode="numeric"
                name="金額入力"
                [(ngModel)]="acWithAmount.amount"
                class="text-xs p-2 rounded-md border border-slate-300 text-gray-700"
              />
            </label>
          }
        </section>

        <!-- 登録ボタン -->
        <button
          type="button"
          aria-label="資産情報を登録する"
          (click)="onRegister()"
          [disabled]="selectedAssetCategories().length === 0"
          class="flex justify-center items-center gap-2 p-3 mt-6 text-base rounded-lg bg-black text-white cursor-pointer hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
        >
          登録
        </button>

      </form>
    </main>
  `,
})
export default class AssetsRegisterComponent implements OnInit {
  private readonly API_BASE_URL = environment.API_BASE_URL;
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private readonly dateService = inject(DateService);
  private readonly assetsService = inject(AssetsService);

  private readonly monthlyAssetsInfo = httpResource<AssetsInfoResponseType[]>(() => ({
    url: `${this.API_BASE_URL}/assets/monthly?baseDate=${this.dateService.getToday()}`,
    method: 'GET',
    credentials: 'include',
  }));
  private readonly assetCategories = httpResource<AssetsCategoryType[]>(() => ({
    url: `${this.API_BASE_URL}/assets/categories`,
    method: 'GET',
    credentials: 'include',
  }));

  private readonly selectedAssetsInfo = computed(() => {
    const selectedYearMonth = this.selectedYearMonth();
    const assets = this.monthlyAssetsInfo.value();

    return assets?.find((a) => a.yearMonth === selectedYearMonth);
  });

  readonly past13YearMonths = this.dateService.generatePast13YearMonths();
  selectedYearMonth = signal(this.dateService.getCurrentYearMonth());

  readonly assetCategoriesWithStatus = computed(() => {
    const assetCategoriesRef = this.assetCategories;
    if (!assetCategoriesRef.hasValue()) return []; // データがまだ取得できていないときは空配列を返しておく

    return assetCategoriesRef.value().map((category) => {
      const isCategoryRegistered = this.selectedAssetsInfo()?.assetsByCategories.some(
        (ac) => ac.category === category.name,
      );

      // selectedAssetsInfoが存在しない（undefined）ケースは当然、仕様上有り得る
      // そのため、存在しない場合は!!演算子で真偽値に変換（undefined → false）させて選択可能にする
      return {
        ...category,
        disabled: !!isCategoryRegistered,
      };
    });
  });
  selectedAssetCategories = signal<{ id: number; name: string }[]>([]);

  selectedAssetCategoriesWithAmount = linkedSignal(() => {
    return this.selectedAssetCategories().map((category) => ({ ...category, amount: 0 }));
  });

  onRegister = async () => {
    if (!confirm('資産情報を登録しますか？')) return;

    const postAssets = this.selectedAssetCategoriesWithAmount().map((c) => ({
      amount: c.amount,
      assetCategoryId: c.id,
      date: `${this.selectedYearMonth()}-01`,
    }));

    await this.assetsService.registerAssets(postAssets);

    // 選択中の資産カテゴリを初期化して、最新の月次資産情報を取得し直す
    this.selectedAssetCategories.set([]);
    this.monthlyAssetsInfo.reload();
  };

  ngOnInit(): void {
    // 1分ごとに認証状態を確認し、認証の有効期限が切れていたらログインページへ遷移させる
    interval(60000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.authService.verifyAuth());
  }
}
