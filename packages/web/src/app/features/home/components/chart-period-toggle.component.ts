import { Component, model } from '@angular/core';
import type { PeriodType } from '../home.types';

@Component({
  selector: 'app-chart-period-toggle',
  imports: [],
  template: `
    <div class="flex gap-1 p-2 rounded-lg bg-white shadow-sm">
      <button
        type="button"
        (click)="periodType.set('月次')"
        class="flex-1 p-2 rounded-md text-gray-700 cursor-pointer"
        [class.shadow-sm]="periodType() === '月次'"
      >
        月次
      </button>
      <button
        type="button"
        (click)="periodType.set('年次')"
        class="flex-1 p-2 rounded-md text-gray-700 cursor-pointer"
        [class.shadow-sm]="periodType() === '年次'"
      >
        年次
      </button>
    </div>
  `,
})
export class ChartPeriodToggleComponent {
  periodType = model.required<PeriodType>();
}
