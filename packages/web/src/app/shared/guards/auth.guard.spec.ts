import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import type { Mocked } from 'vitest';
import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';

@Component({ selector: 'app-protected', template: '<h1>Protected Page</h1>' })
class Protected {}
@Component({ selector: 'app-login', template: '<h1>Login Page</h1>' })
class Login {}

describe('authGuard', () => {
  let authServiceMock: Pick<Mocked<AuthService>, 'authCheck'>;
  let routerHarness: RouterTestingHarness;

  const setup = async ({ isAuthenticated }: { isAuthenticated: boolean }) => {
    authServiceMock = { authCheck: vi.fn().mockResolvedValue(isAuthenticated) };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        provideRouter([
          { path: 'protected', component: Protected, canActivate: [authGuard] },
          { path: 'login', component: Login },
        ]),
      ],
    });

    routerHarness = await RouterTestingHarness.create();
  };

  it('有効な認証状態であれば 保護されたページ に遷移できること', async () => {
    await setup({ isAuthenticated: true });
    await routerHarness.navigateByUrl('/protected', Protected);

    expect(routerHarness.routeNativeElement?.textContent).toContain('Protected Page');
  });

  it('無効な認証状態であれば ログインページ へリダイレクトされること', async () => {
    await setup({ isAuthenticated: false });
    await routerHarness.navigateByUrl('/protected', Login);

    expect(routerHarness.routeNativeElement?.textContent).toContain('Login Page');
  });
});
