import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-not-found',
  imports: [],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div class="w-screen h-svh overflow-hidden grid place-content-center p-4 bg-white text-black">
      <p class="text-3xl font-extrabold">404 Not Found</p>
    </div>
  `,
})
export default class NotFoundComponent {}
