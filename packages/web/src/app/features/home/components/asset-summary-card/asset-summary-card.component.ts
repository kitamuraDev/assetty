import { DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import type { AssetsInfoResponseType } from '@api-spec/shared/assets.schema';

@Component({
  selector: 'app-asset-summary-card',
  imports: [DecimalPipe],
  template: `
    <section class="p-4 rounded-lg bg-white shadow-sm">
      <time class="text-sm text-gray-700 mb-1">{{ assetInfo()?.yearMonth }}</time>
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-700">資産合計</span>
        <div class="text-2xl">{{ assetInfo()?.totalAssets | number }}<span class="text-sm ml-1">円</span></div>
      </div>
    </section>
  `,
})
export class AssetSummaryCardComponent {
  assetInfo = input.required<AssetsInfoResponseType | undefined>();
}
