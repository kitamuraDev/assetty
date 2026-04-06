import type { ErrorResponseType } from '@api-spec/shared/error.schema';
import { getPlatformProxy } from 'wrangler';
import app from '../..';
import { getSetCookieHeader, login } from '../../test/helpers';

const { env } = await getPlatformProxy<CloudflareBindings>();

describe('GET: /user', () => {
  it('ログイン済であればそのユーザーの情報を返すこと', async () => {
    const loginResponse = await login(env, { name: env.TEST_USER_NAME, password: env.TEST_USER_PASSWORD });
    const cookie = getSetCookieHeader(loginResponse.headers);

    const res = await app.request('/api/user', { method: 'GET', headers: { cookie: cookie } }, env);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: env.TEST_USER_ID, name: env.TEST_USER_NAME });
  });

  it('未ログインであれば401番を返すこと', async () => {
    const expectedResponse: ErrorResponseType = { code: 'INVALID_ACCESS_TOKEN', message: 'Invalid Access Token' };

    const res = await app.request('/api/user', { method: 'GET' }, env);

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual(expectedResponse);
  });
});
