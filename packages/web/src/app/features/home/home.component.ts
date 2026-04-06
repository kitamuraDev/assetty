import { Component, DestroyRef, inject, type OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { interval } from 'rxjs';

import { HeaderComponent } from '../../shared/components/header/header.component';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-home',
  imports: [HeaderComponent],
  template: `
    <app-header />
  `,
})
export default class HomeComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

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
