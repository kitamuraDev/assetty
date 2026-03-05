import { httpResource } from '@angular/common/http';
import { Component, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import type { paths } from '@api-spec/schema';
import { environment } from '../environments/environment';

type User = paths['/users']['get']['responses']['200']['content']['application/json'];

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App {
  static readonly API_BASE_URL = environment.API_BASE_URL;
  readonly user = httpResource<User>(() => `${App.API_BASE_URL}/users?name=Lillie`);

  constructor() {
    console.log('API_BASE_URL', App.API_BASE_URL);
    effect(() => {
      if (!this.user.isLoading()) console.log('user', this.user.value());
    });
  }
}
