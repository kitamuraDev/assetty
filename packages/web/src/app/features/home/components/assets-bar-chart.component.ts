import { Component, input, output } from '@angular/core';
import type { ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-assets-bar-chart',
  imports: [BaseChartDirective],
  template: `
    <section class="p-4 rounded-lg bg-white shadow-sm">
      <canvas baseChart type="bar" [data]="barChartData()" [options]="barChartOptions" (chartClick)="updateCurrentAssetInfo.emit($event)" height="300"></canvas>
    </section>
  `,
})
export class AssetsBarChartComponent {
  barChartData = input.required<ChartData<'bar'>>();
  updateCurrentAssetInfo = output<{ active?: object[] }>();

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
      },
      y: {
        stacked: true,
        ticks: {
          stepSize: 2000000, // 200刻みでメモリを表示
          callback: (value) => (typeof value === 'number' ? `${(value / 10000).toFixed(0)}` : value), // 万円単位で表示
        },
      },
    },
    plugins: {
      legend: { position: 'bottom' },
    },
  };
}
