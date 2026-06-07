import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import type {
  AuthCheckResponseType,
  LoginRequestBodyType,
  LoginSuccessResponseType,
} from '@api-spec/shared/auth.schema';
import { firstValueFrom } from 'rxjs';
import { safeParse } from 'valibot';
import { environment } from '../../../environments/environment';
import { HttpErrorResponseSchema } from '../schemas/api-error.schema';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_BASE_URL = environment.API_BASE_URL;
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  async login(body: LoginRequestBodyType): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post<LoginSuccessResponseType>(`${this.API_BASE_URL}/auth/login`, body, { credentials: 'include' }),
      );

      await this.router.navigate(['/']);
    } catch (e) {
      const result = safeParse(HttpErrorResponseSchema, e);

      if (result.success && result.output.body) {
        alert(result.output.body.message);
      } else {
        alert('予期しないエラーが発生しました');
      }
    }
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`${this.API_BASE_URL}/auth/logout`, null, { credentials: 'include' }));

      await this.router.navigate(['/login']);
    } catch (e) {
      const result = safeParse(HttpErrorResponseSchema, e);

      if (result.success && result.output.body) {
        alert(result.output.body.message);
      } else {
        alert('予期しないエラーが発生しました');
      }
    }
  }

  async authCheck(): Promise<boolean> {
    try {
      const { ok } = await firstValueFrom(
        this.http.get<AuthCheckResponseType>(`${this.API_BASE_URL}/auth/check`, { credentials: 'include' }),
      );

      return ok;
    } catch (_e) {
      return false;
    }
  }

  async verifyAuth(): Promise<void> {
    const isLogin = await this.authCheck();

    if (!isLogin) {
      await this.router.navigateByUrl('/login');
      alert('ログイン有効期限が切れました。ログインし直してください');
    }
  }
}
