import { provideHttpClient, withFetch } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import type { AuthCheckResponseType, LoginSuccessResponseType } from '@api-spec/shared/auth.schema';
import type { ErrorResponse } from '@api-spec/shared/error.schema';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

const mockServer = setupServer();
const API_BASE_URL = environment.API_BASE_URL;

describe('AuthService', () => {
  let service: AuthService;
  let router: Router;

  afterAll(() => mockServer.close());
  afterEach(() => mockServer.resetHandlers());
  beforeAll(() => {
    mockServer.listen();
    window.alert = vi.fn(); // 最初に一度だけ alert をモックしておく（※browserモードに移行したら不要になる）
  });
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withFetch())],
    });

    service = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  describe('login', () => {
    it('ログインに成功したら、ルートページへ遷移されること', async () => {
      mockServer.use(
        http.post(`${API_BASE_URL}/auth/login`, () => {
          return HttpResponse.json<LoginSuccessResponseType>({ name: 'valid_user_name' }, { status: 200 });
        }),
      );
      const navigateSpy = vi.spyOn(router, 'navigate');

      await service.login({ name: 'valid_user_name', password: 'valid_password' });

      expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });

    it('ログインに失敗したら、エラーレスポンスのメッセージが alert に表示されること', async () => {
      mockServer.use(
        http.post(`${API_BASE_URL}/auth/login`, () => {
          return HttpResponse.json<ErrorResponse>(
            { code: 'INVALID_CREDENTIALS', message: 'Invalid Credentials' },
            { status: 401 },
          );
        }),
      );
      const alertSpy = vi.spyOn(window, 'alert');

      await service.login({ name: 'invalid_user_name', password: 'invalid_password' });

      expect(alertSpy).toHaveBeenCalledWith('Invalid Credentials');
    });
  });

  describe('authCheck', () => {
    it('有効な認証状態であれば true を返すこと', async () => {
      mockServer.use(
        http.get(`${API_BASE_URL}/auth/check`, () => {
          return HttpResponse.json<AuthCheckResponseType>({ ok: true }, { status: 200 });
        }),
      );

      const result = await service.authCheck();

      expect(result).toBeTruthy();
    });

    it('無効な認証状態であれば false を返すこと', async () => {
      mockServer.use(
        http.get(`${API_BASE_URL}/auth/check`, () => {
          return HttpResponse.json<ErrorResponse>(
            { code: 'INVALID_ACCESS_TOKEN', message: 'Invalid Access Token' },
            { status: 401 },
          );
        }),
      );

      const result = await service.authCheck();

      expect(result).toBeFalsy();
    });
  });
});
