import '@testing-library/jest-dom/vitest';
import { Location } from '@angular/common';
import { provideHttpClient, withFetch } from '@angular/common/http';
import type { LoginSuccessResponseType } from '@api-spec/shared/auth.schema';
import type { ErrorResponse } from '@api-spec/shared/error.schema';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { environment } from '../../../environments/environment';
import LoginComponent from './login.component';

const mockServer = setupServer();
const API_BASE_URL = environment.API_BASE_URL;

describe('LoginComponent', () => {
  let user: ReturnType<typeof userEvent.setup>;

  afterAll(() => mockServer.close());
  afterEach(() => mockServer.resetHandlers());
  beforeAll(() => {
    mockServer.listen();
    window.alert = vi.fn(); // 最初に一度だけ alert をモックしておく（※browserモードに移行したら不要になる）
  });
  beforeEach(() => {
    user = userEvent.setup();
  });

  it('ログインに成功したら、ルートページへ遷移されること', async () => {
    mockServer.use(
      http.post(`${API_BASE_URL}/auth/login`, () => {
        return HttpResponse.json<LoginSuccessResponseType>({ name: 'valid_user_name' }, { status: 200 });
      }),
    );

    const { fixture } = await render(LoginComponent, {
      providers: [provideHttpClient(withFetch())],
    });
    const location = fixture.componentRef.injector.get(Location);

    const usernameInput = screen.getByLabelText('ユーザー名');
    await user.clear(usernameInput).then(() => user.type(usernameInput, 'valid_user_name'));
    const passwordInput = screen.getByLabelText('パスワード');
    await user.clear(passwordInput).then(() => user.type(passwordInput, 'valid_password'));

    const loginButton = screen.getByRole('button', { name: 'ログインする' });
    await user.click(loginButton);
    await fixture.whenStable();

    expect(location.path()).toBe('/');
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

    const { fixture } = await render(LoginComponent, {
      providers: [provideHttpClient(withFetch())],
    });

    const usernameInput = screen.getByLabelText('ユーザー名');
    await user.clear(usernameInput).then(() => user.type(usernameInput, 'invalid_user_name'));
    const passwordInput = screen.getByLabelText('パスワード');
    await user.clear(passwordInput).then(() => user.type(passwordInput, 'invalid_password'));

    const loginButton = screen.getByRole('button', { name: 'ログインする' });
    await user.click(loginButton);
    await fixture.whenStable();

    expect(vi.spyOn(window, 'alert')).toHaveBeenCalledWith('Invalid Credentials');
  });

  it('ユーザー名の入力欄横のバツ印を押下したら、ユーザー名の入力欄が空になること', async () => {
    await render(LoginComponent);

    const usernameInput = screen.getByLabelText('ユーザー名');
    await user.clear(usernameInput).then(() => user.type(usernameInput, 'some_user_name'));
    expect(usernameInput).toHaveValue('some_user_name');

    const clearUsernameButton = screen.getByRole('button', { name: 'ユーザーネームの入力値を削除する' });
    await user.click(clearUsernameButton);

    expect(usernameInput).toHaveValue('');
  });

  it('パスワードの入力欄横のバツ印を押下したら、パスワードの入力欄が空になること', async () => {
    await render(LoginComponent);

    const passwordInput = screen.getByLabelText('パスワード');
    await user.clear(passwordInput).then(() => user.type(passwordInput, 'some_password'));
    expect(passwordInput).toHaveValue('some_password');

    const clearPasswordButton = screen.getByRole('button', { name: 'パスワードの入力値を削除する' });
    await user.click(clearPasswordButton);

    expect(passwordInput).toHaveValue('');
  });

  it('パスワードの入力欄の表示/非表示切り替えアイコンを押下したら、パスワードの入力欄のタイプが password と text の間で切り替わること', async () => {
    await render(LoginComponent);

    const togglePasswordVisibilityButton = screen.getByRole('button', { name: 'パスワードの表示切替' });
    const passwordInput = screen.getByLabelText('パスワード');

    expect(passwordInput).toHaveAttribute('type', 'password'); // 初期状態

    await user.click(togglePasswordVisibilityButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    await user.click(togglePasswordVisibilityButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('バリデーションエラーが起きている場合はログインボタンが押下できないこと', async () => {
    await render(LoginComponent);

    // 初期状態は両方の入力欄が空なので、ログインボタンは押下できない状態であること
    const loginButton = screen.getByRole('button', { name: 'ログインする' });
    expect(loginButton).toBeDisabled();

    const usernameInput = screen.getByLabelText('ユーザー名');
    await user
      .clear(usernameInput)
      .then(() => user.type(usernameInput, 'some_user_name'))
      .then(() => user.clear(usernameInput));
    expect(screen.getByText('ユーザーネームは必須です')).toBeVisible();

    const passwordInput = screen.getByLabelText('パスワード');
    await user
      .clear(passwordInput)
      .then(() => user.type(passwordInput, 'some_password'))
      .then(() => user.clear(passwordInput));
    expect(screen.getByText('パスワードは必須です')).toBeVisible();

    expect(loginButton).toBeDisabled();

    await user.type(usernameInput, 'some_user_name');
    await user.type(passwordInput, 'some_password');

    // 両方の入力欄に値が入力されていれば、ログインボタンは押下できる状態になること
    expect(loginButton).toBeEnabled();
  });
});
