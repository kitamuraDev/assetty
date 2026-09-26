import { env } from 'cloudflare:workers';
import type { LoginSuccessResponseType } from '@api-spec/api-types';
import { decode } from 'hono/jwt';
import app from '../..';
import { ERROR_RESPONSE } from '../../middleware/error-response';
import { type InsertUserType, resetUsersAndSeedTestUser } from '../../test/fixtures';
import { getAccessTokenFromSetCookie, getSetCookieHeader, login, logout } from '../../test/helpers';

const user: InsertUserType = {
  id: 'tfi4wB9ZRyhzVE7EhIyht',
  name: 'Lillie',
  password: 'Lillie1101',
};

describe('POST: /auth/login', () => {
  beforeEach(async () => {
    await resetUsersAndSeedTestUser({ d1Database: env.ASSETTY_D1, user });
  });

  it('認証成功したときにユーザー名が返却されること', async () => {
    const res = await login(env, { name: user.name, password: user.password });

    expect(res.status).toBe(200);
    expect((await res.json<LoginSuccessResponseType>()).name).toBe(user.name);
  });

  it('アクセストークン(JWT)のペイロードにsub,aud,iss,expが設定されていること', async () => {
    const res = await login(env, { name: user.name, password: user.password });
    const accessToken = getAccessTokenFromSetCookie(env, res.headers);
    const payload = decode(accessToken).payload;

    expect(payload['sub']).toBeDefined();
    expect(payload['aud']).toBeDefined();
    expect(payload['iss']).toBeDefined();
    expect(payload['exp']).toBeDefined();
  });

  it('アクセストークン(JWT)のaudとissが環境変数で設定している値と一致すること', async () => {
    const res = await login(env, { name: user.name, password: user.password });
    const accessToken = getAccessTokenFromSetCookie(env, res.headers);
    const payload = decode(accessToken).payload;

    expect(payload['aud']).toBe(env.JWT_AUDIENCE);
    expect(payload['iss']).toBe(env.JWT_ISSUER);
  });

  it('アクセストークン(JWT)のexpが環境変数で設定している値に近しいこと', async () => {
    const expectedExpiration = 60 * Number(env.JWT_EXPIRATION_MINUTES);

    const beforeLoginTime = Math.floor(Date.now() / 1000);
    const res = await login(env, { name: user.name, password: user.password });
    const afterLoginTime = Math.floor(Date.now() / 1000);

    const accessToken = getAccessTokenFromSetCookie(env, res.headers);
    const payload = decode(accessToken).payload;

    // ログイン時刻 + 設定した有効期限 の範囲内にあることを確認
    expect(payload['exp']).toBeGreaterThanOrEqual(beforeLoginTime + expectedExpiration);
    expect(payload['exp']).toBeLessThanOrEqual(afterLoginTime + expectedExpiration);
  });

  it('リクエストボディ(name)の欠損でバリデーションエラーを示す400番が返ること', async () => {
    const res = await login(env, { password: user.password });
    expect(res.status).toBe(400);
  });

  it('リクエストボディ(password)の欠損でバリデーションエラーを示す400番が返ること', async () => {
    const res = await login(env, { name: user.name });
    expect(res.status).toBe(400);
  });

  it('リクエストボディ(全プロパティ)の欠損でバリデーションエラーを示す400番が返ること', async () => {
    const res = await login(env, {});
    expect(res.status).toBe(400);
  });

  it('存在しないユーザー名の場合、認証失敗を示す401番が返ること', async () => {
    const { status, ...expectedResponse } = ERROR_RESPONSE.INVALID_CREDENTIALS;

    const res = await login(env, { name: 'unknown_user', password: user.password });

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual(expectedResponse);
  });

  it('パスワードに誤りがある場合、認証失敗を示す401番が返ること', async () => {
    const { status, ...expectedResponse } = ERROR_RESPONSE.INVALID_CREDENTIALS;

    const res = await login(env, { name: user.name, password: 'incorrect_password' });

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual(expectedResponse);
  });
});

describe('POST: /auth/logout', async () => {
  it('/auth/logout を叩くとアクセストークンが削除されて空文字になること', async () => {
    const loginResponse = await login(env, { name: user.name, password: user.password });
    const cookie = getSetCookieHeader(loginResponse.headers);

    const logoutResponse = await logout(env, { cookie });

    expect(logoutResponse.status).toBe(204);
    expect(getAccessTokenFromSetCookie(env, logoutResponse.headers)).toBe('');
  });
});

describe('POST: /auth/check', async () => {
  it('認証情報が有効であれば200番を返す', async () => {
    const loginResponse = await login(env, { name: user.name, password: user.password });
    const cookie = getSetCookieHeader(loginResponse.headers);

    const res = await app.request('/api/auth/check', { method: 'GET', headers: { cookie: cookie } }, env);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it('認証情報が無効であれば401番を返す', async () => {
    const { status, ...expectedResponse } = ERROR_RESPONSE.INVALID_ACCESS_TOKEN;

    const res = await app.request('/api/auth/check', { method: 'GET' }, env);

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual(expectedResponse);
  });
});
