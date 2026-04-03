import type { LoginRequestBodyType } from '@api-spec/shared/auth.schema';
import app from '../..';

/**
 * ログインを行う
 * テスト環境ではログインを行えばcookieが以降のリクエストに含まれるわけではないため、cookieをレスポンスから取得して返却（→ 各テストではリクエスト時にcookieを付与）するようにしている
 *
 * @param env
 * @param { name, password }
 * @returns Promise<Response>
 */
export const login = async (env: CloudflareBindings, { name, password }: Partial<LoginRequestBodyType>) => {
  const res = await app.request(
    '/api/auth/login',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password }),
    },
    env,
  );

  return res;
};

/**
 * ログアウトを行う
 *
 * @param env
 * @param { cookie }
 * @returns Promise<Response>
 */
export const logout = async (env: CloudflareBindings, { cookie }: { cookie: string }) => {
  const res = await app.request(
    '/api/auth/logout',
    {
      method: 'POST',
      headers: {
        cookie: cookie,
      },
    },
    env,
  );

  return res;
};

/**
 * set-cookieヘッダーの値を取得する
 *
 * @param headers
 * @returns set-cookie の値
 */
export const getSetCookieHeader = (headers: Headers) => {
  return headers.get('set-cookie') ?? '';
};

/**
 * set-cookieヘッダーからJWTを取得する
 *
 * @param env
 * @param headers
 * @returns JWT || ''
 */
export const getAccessTokenFromSetCookie = (env: CloudflareBindings, headers: Headers) => {
  const token = getSetCookieHeader(headers)
    .split(';')
    .find((header) => header.includes(env.JWT_ACCESS_TOKEN))
    ?.split('=')[1]; // [ 'key_is_token', 'value_is_jwt' ] から jwtを取得する

  return token ?? '';
};
