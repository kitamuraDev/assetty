import { Component, input, output } from '@angular/core';
import type { PeriodType } from '../../home.component';

// TODO: 本来であれば、単一のボタン単位でコンポーネントに切り出したいところなので余裕があるときにリファクタリングする
@Component({
  selector: 'app-chart-period-toggle',
  imports: [],
  template: `
    <div class="flex gap-1 p-2 rounded-lg bg-white shadow-sm">
      <button
        type="button"
        (click)="changePeriodType.emit('月次')"
        class="flex-1 p-2 rounded-md text-gray-700 cursor-pointer"
        [class.shadow-sm]="periodType() === '月次'"
      >
        月次
      </button>
      <button
        type="button"
        (click)="changePeriodType.emit('年次')"
        class="flex-1 p-2 rounded-md text-gray-700 cursor-pointer"
        [class.shadow-sm]="periodType() === '年次'"
      >
        年次
      </button>
    </div>
  `,
})
export class ChartPeriodToggleComponent {
  periodType = input.required<PeriodType>();
  changePeriodType = output<PeriodType>();
}
