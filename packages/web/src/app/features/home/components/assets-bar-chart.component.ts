import { Component, input, output } from '@angular/core';
import type { ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { array, integer, looseObject, minValue, number, object, optional, pipe, safeParse } from 'valibot';

// Chart.js のクリックイベントから、選択要素の非負整数の index を取り出すためのスキーマ
const ChartClickEventSchema = object({
  active: optional(
    array(
      // Chart.js の要素情報に index 以外のプロパティも含まれるため、余分なキーを許容する
      looseObject({
        index: pipe(number(), integer(), minValue(0)),
      }),
    ),
  ),
});

@Component({
  selector: 'app-assets-bar-chart',
  imports: [BaseChartDirective],
  template: `
    <section class="p-4 rounded-lg bg-white shadow-sm">
      <canvas
        baseChart
        type="bar"
        [data]="barChartData()"
        [options]="barChartOptions"
        (chartClick)="onChartClick($event)"
        height="300"
      ></canvas>
    </section>
  `,
})
export class AssetsBarChartComponent {
  barChartData = input.required<ChartData<'bar'>>();
  selectedIndex = output<number>();

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

  /**
   * Chart.js のクリックイベントを検証し、選択された要素の index を通知する
   * @param event Chart.js のクリックイベント
   */
  onChartClick(event: unknown): void {
    const result = safeParse(ChartClickEventSchema, event);
    if (!result.success) return;

    const index = result.output.active?.[0]?.index;
    if (index !== undefined) this.selectedIndex.emit(index);
  }
}
