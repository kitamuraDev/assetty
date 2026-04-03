import type { LoginSuccessResponseType } from '@api-spec/shared/auth.schema';
import type { ErrorResponse } from '@api-spec/shared/error.schema';
import { decode } from 'hono/jwt';
import { getPlatformProxy } from 'wrangler';
import app from '../..';
import { getAccessTokenFromSetCookie, getSetCookieHeader, login, logout } from './test.helper';

const { env } = await getPlatformProxy<CloudflareBindings>();

describe('POST: /auth/login', () => {
  it('認証成功したときにユーザー名が返却されること', async () => {
    const res = await login(env, { name: env.TEST_USER_NAME, password: env.TEST_USER_PASSWORD });

    expect(res.status).toBe(200);
    expect((await res.json<LoginSuccessResponseType>()).name).toBe(env.TEST_USER_NAME);
  });

  it('アクセストークン(JWT)のペイロードにsub,aud,iss,expが設定されていること', async () => {
    const res = await login(env, { name: env.TEST_USER_NAME, password: env.TEST_USER_PASSWORD });
    const accessToken = getAccessTokenFromSetCookie(env, res.headers);
    const payload = decode(accessToken).payload;

    expect(payload['sub']).toBeDefined();
    expect(payload['aud']).toBeDefined();
    expect(payload['iss']).toBeDefined();
    expect(payload['exp']).toBeDefined();
  });

  it('アクセストークン(JWT)のaudとissが環境変数で設定している値と一致すること', async () => {
    const res = await login(env, { name: env.TEST_USER_NAME, password: env.TEST_USER_PASSWORD });
    const accessToken = getAccessTokenFromSetCookie(env, res.headers);
    const payload = decode(accessToken).payload;

    expect(payload['aud']).toBe(env.JWT_AUDIENCE);
    expect(payload['iss']).toBe(env.JWT_ISSUER);
  });

  it('アクセストークン(JWT)のexpが環境変数で設定している値に近しいこと', async () => {
    const expectedExpiration = 60 * Number(env.JWT_EXPIRATION_MINUTES);

    const beforeLoginTime = Math.floor(Date.now() / 1000);
    const res = await login(env, { name: env.TEST_USER_NAME, password: env.TEST_USER_PASSWORD });
    const afterLoginTime = Math.floor(Date.now() / 1000);

    const accessToken = getAccessTokenFromSetCookie(env, res.headers);
    const payload = decode(accessToken).payload;

    // ログイン時刻 + 設定した有効期限 の範囲内にあることを確認
    expect(payload['exp']).toBeGreaterThanOrEqual(beforeLoginTime + expectedExpiration);
    expect(payload['exp']).toBeLessThanOrEqual(afterLoginTime + expectedExpiration);
  });

  it('リクエストボディ(name)の欠損でバリデーションエラーを示す400番が返ること', async () => {
    const res = await login(env, { password: env.TEST_USER_PASSWORD });
    expect(res.status).toBe(400);
  });

  it('リクエストボディ(password)の欠損でバリデーションエラーを示す400番が返ること', async () => {
    const res = await login(env, { name: env.TEST_USER_NAME });
    expect(res.status).toBe(400);
  });

  it('リクエストボディ(全プロパティ)の欠損でバリデーションエラーを示す400番が返ること', async () => {
    const res = await login(env, {});
    expect(res.status).toBe(400);
  });

  it('存在しないユーザー名の場合、認証失敗を示す401番が返ること', async () => {
    const expectedResponse: ErrorResponse = { code: 'INVALID_CREDENTIALS', message: 'Invalid Credentials' };

    const res = await login(env, { name: 'unknown_user', password: env.TEST_USER_PASSWORD });

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual(expectedResponse);
  });

  it('パスワードに誤りがある場合、認証失敗を示す401番が返ること', async () => {
    const expectedResponse: ErrorResponse = { code: 'INVALID_CREDENTIALS', message: 'Invalid Credentials' };

    const res = await login(env, { name: env.TEST_USER_NAME, password: 'incorrect_password' });

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual(expectedResponse);
  });
});

describe('POST: /auth/logout', async () => {
  it('/auth/logout を叩くとアクセストークンが削除されて空文字になること', async () => {
    const loginResponse = await login(env, { name: env.TEST_USER_NAME, password: env.TEST_USER_PASSWORD });
    const cookie = getSetCookieHeader(loginResponse.headers);

    const logoutResponse = await logout(env, { cookie });

    expect(logoutResponse.status).toBe(204);
    expect(getAccessTokenFromSetCookie(env, logoutResponse.headers)).toBe('');
  });
});

describe('POST: /auth/check', async () => {
  it('認可情報が有効であれば200番を返す', async () => {
    const loginResponse = await login(env, { name: env.TEST_USER_NAME, password: env.TEST_USER_PASSWORD });
    const cookie = getSetCookieHeader(loginResponse.headers);

    const res = await app.request('/api/auth/check', { method: 'GET', headers: { cookie: cookie } }, env);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it('認可情報が無効であれば401番を返す', async () => {
    const expectedResponse: ErrorResponse = { code: 'INVALID_ACCESS_TOKEN', message: 'Invalid Access Token' };

    const res = await app.request('/api/auth/check', { method: 'GET' }, env);

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual(expectedResponse);
  });
});
