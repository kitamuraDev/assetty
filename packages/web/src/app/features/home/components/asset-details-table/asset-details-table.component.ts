import { DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import type { AssetsInfoResponseType } from '@api-spec/shared/assets.schema';

@Component({
  selector: 'app-asset-details-table',
  imports: [DecimalPipe],
  template: `
    <section class="rounded-lg bg-white shadow-sm overflow-hidden">
      <table class="w-full">
        <thead class="border-b border-slate-200 bg-slate-50">
          <tr>
            <th class="px-4 py-3 text-left text-sm text-gray-700">資産クラス</th>
            <th class="px-4 py-3 text-right text-sm text-gray-700">時価評価額</th>
            <th class="px-4 py-3 text-right text-sm text-gray-700">保有割合</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          @for (asset of assetInfo()?.assetsByCategories; track $index) {
            <tr>
              <td class="px-4 py-3 text-left text-sm">
                <span class="text-sm">{{ asset.category }}</span>
              </td>
              <td class="px-4 py-3 text-right text-sm">
                {{ asset.amount | number }}<span class="text-xs ml-1">円</span>
              </td>
              <td class="px-4 py-3 text-right text-sm">
                {{ asset.rate }}<span class="text-xs">%</span>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </section>
  `,
})
export class AssetDetailsTableComponent {
  assetInfo = input.required<AssetsInfoResponseType | undefined>();
}
