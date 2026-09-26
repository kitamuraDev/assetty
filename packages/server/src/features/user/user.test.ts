import { env } from 'cloudflare:workers';
import app from '../..';
import { ERROR_RESPONSE } from '../../middleware/error-response';
import { type InsertUserType, resetUsersAndSeedTestUser } from '../../test/fixtures';
import { getSetCookieHeader, login } from '../../test/helpers';

const user: InsertUserType = {
  id: 'tfi4wB9ZRyhzVE7EhIyht',
  name: 'Lillie',
  password: 'Lillie1101',
};

describe('GET: /user', () => {
  beforeEach(async () => {
    await resetUsersAndSeedTestUser({ d1Database: env.ASSETTY_D1, user });
  });

  it('ログイン済であればそのユーザーの情報を返すこと', async () => {
    const loginResponse = await login(env, { name: user.name, password: user.password });
    const cookie = getSetCookieHeader(loginResponse.headers);

    const res = await app.request('/api/user', { method: 'GET', headers: { cookie: cookie } }, env);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: user.id, name: user.name });
  });

  it('未ログインであれば401番を返すこと', async () => {
    const { status, ...expectedResponse } = ERROR_RESPONSE.INVALID_ACCESS_TOKEN;

    const res = await app.request('/api/user', { method: 'GET' }, env);

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual(expectedResponse);
  });
});
