import type { ErrorResponse } from '@api-spec/shared/error.schema';
import { sign } from 'hono/jwt';
import type { JWTPayload } from 'hono/utils/jwt/types';
import { getPlatformProxy } from 'wrangler';
import app from '..';
import { getSetCookieHeader, login, logout } from '../features/auth/test.helper';
import { jwtAuthMiddleware } from './auth';

const { env } = await getPlatformProxy<CloudflareBindings>();

describe('jwtAuthMiddleware', () => {
  app.use('/message', jwtAuthMiddleware); // アクセストークンの検証（認可制御）
  app.get('/message', (c) => c.json({ message: 'Assetty' }, 200));

  it('/api/message にリクエストする際、アクセストークンが有効であれば200番を返すこと', async () => {
    const loginResponse = await login(env, { name: env.TEST_USER_NAME, password: env.TEST_USER_PASSWORD });
    const cookie = getSetCookieHeader(loginResponse.headers);

    const res = await app.request('/api/message', { method: 'GET', headers: { cookie: cookie } }, env);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ message: 'Assetty' });
  });

  it('/api/message にリクエストする際、アクセストークンが無効であれば401番を返すこと', async () => {
    const expectedSuccessResponse = { message: 'Assetty' };
    const loginResponse = await login(env, { name: env.TEST_USER_NAME, password: env.TEST_USER_PASSWORD });
    const validCookie = getSetCookieHeader(loginResponse.headers);

    const successRes = await app.request('/api/message', { method: 'GET', headers: { cookie: validCookie } }, env);

    expect(successRes.status).toBe(200);
    expect(await successRes.json()).toEqual(expectedSuccessResponse);

    const expectedErrorResponse: ErrorResponse = { code: 'INVALID_ACCESS_TOKEN', message: 'Invalid Access Token' };
    const logoutResponse = await logout(env, { cookie: validCookie });
    const invalidCookie = getSetCookieHeader(logoutResponse.headers);

    const failureRes = await app.request('/api/message', { method: 'GET', headers: { cookie: invalidCookie } }, env);

    expect(failureRes.status).toBe(401);
    expect(await failureRes.json()).toEqual(expectedErrorResponse);
  });

  it('アクセストークンを保持するcookieがheadersになければ401番を返すこと', async () => {
    const expectedResponse: ErrorResponse = { code: 'INVALID_ACCESS_TOKEN', message: 'Invalid Access Token' };

    const res = await app.request('/api/message', { method: 'GET' }, env);

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual(expectedResponse);
  });

  it('アクセストークンを署名する際の秘密鍵が異なる場合は401番を返すこと', async () => {
    const expectedResponse: ErrorResponse = { code: 'INVALID_ACCESS_TOKEN', message: 'Invalid Access Token' };
    const payload: JWTPayload = {
      sub: 'some-user-id',
      aud: env.JWT_AUDIENCE,
      iss: env.JWT_ISSUER,
    };
    const reusedAccessToken = await sign(payload, 'invalid_secret_key', 'HS256');

    const res = await app.request(
      '/api/message',
      { method: 'GET', headers: { cookie: `${env.JWT_ACCESS_TOKEN}=${reusedAccessToken}` } },
      env,
    );

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual(expectedResponse);
  });

  it('アクセストークンのaudが異なる場合は401番を返すこと', async () => {
    const expectedResponse: ErrorResponse = { code: 'INVALID_ACCESS_TOKEN', message: 'Invalid Access Token' };
    const payload: JWTPayload = {
      sub: 'some-user-id',
      aud: 'https://other-service-web.com',
      iss: env.JWT_ISSUER,
    };
    const reusedAccessToken = await sign(payload, env.JWT_SECRET_KEY, 'HS256');

    const res = await app.request(
      '/api/message',
      { method: 'GET', headers: { cookie: `${env.JWT_ACCESS_TOKEN}=${reusedAccessToken}` } },
      env,
    );

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual(expectedResponse);
  });

  it('アクセストークンのissが異なる場合は401番を返すこと', async () => {
    const expectedResponse: ErrorResponse = { code: 'INVALID_ACCESS_TOKEN', message: 'Invalid Access Token' };
    const payload: JWTPayload = {
      sub: 'some-user-id',
      aud: env.JWT_AUDIENCE,
      iss: 'https://other-service-server.com',
    };
    const reusedAccessToken = await sign(payload, env.JWT_SECRET_KEY, 'HS256');

    const res = await app.request(
      '/api/message',
      { method: 'GET', headers: { cookie: `${env.JWT_ACCESS_TOKEN}=${reusedAccessToken}` } },
      env,
    );

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual(expectedResponse);
  });
});
