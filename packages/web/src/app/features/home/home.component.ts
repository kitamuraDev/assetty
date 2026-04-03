import { httpResource } from '@angular/common/http';
import { Component, DestroyRef, inject, type OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import type { paths } from '@api-spec/schema';
import { interval } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../shared/services/auth.service';

export type Message = paths['/message']['get']['responses']['200']['content']['application/json'];

@Component({
  selector: 'app-home',
  imports: [],
  template: `
    <div class="w-screen h-svh overflow-hidden grid place-content-center p-4 bg-white text-black">
      @if (result.isLoading()) {
        <p>Loading...</p>
      } @else if (result.error()) {
        <p>Sorry Someting Error...</p>
      } @else {
        <p class="font-heading text-6xl font-extrabold italic">{{ result.value()?.message }}</p>
      }
    </div>
  `,
})
export default class HomeComponent implements OnInit {
  private readonly API_BASE_URL = environment.API_BASE_URL;
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly result = httpResource<Message>(() => ({
    url: `${this.API_BASE_URL}/message`,
    method: 'GET',
    credentials: 'include',
  }));

  ngOnInit(): void {
    interval(60000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.verifyAuth());
  }

  /**
   * ログインの有効状態を検証する。無効なら`/login`にリダイレクトさせる
   */
  private async verifyAuth(): Promise<void> {
    const isLogin = await this.authService.authCheck();

    if (!isLogin) {
      await this.router.navigateByUrl('/login');
      alert('ログイン有効期限が切れました。ログインし直してください');
    }
  }
}
