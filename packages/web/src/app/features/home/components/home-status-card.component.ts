import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-home-status-card',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <section class="max-w-xl mx-auto mt-16 p-8 rounded-xl border border-slate-200 bg-white shadow-sm">
      <h2 class="text-xl font-semibold text-slate-900">{{ title() }}</h2>
      <p class="mt-3 text-sm leading-6 text-slate-600">{{ message() }}</p>
      <div class="flex justify-center mt-6">
        <ng-content />
      </div>
    </section>
  `,
})
export class HomeStatusCardComponent {
  title = input.required<string>();
  message = input.required<string>();
}
