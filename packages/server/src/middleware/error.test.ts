import { env } from 'cloudflare:workers';
import { HTTPException } from 'hono/http-exception';
import { createHonoApp } from '../app';
import { ERROR_RESPONSE } from './error-response';

describe('errorHandlingMiddleware', () => {
  const errorResponses = Object.values(ERROR_RESPONSE).map(({ status, code }) => ({ status, code }));

  it.each(errorResponses)(
    'HTTPException($status, $code)に対応するエラーレスポンスを返すこと',
    async ({ status, code }) => {
      const { status: expectedStatus, ...body } = ERROR_RESPONSE[code];

      const app = createHonoApp().basePath('/api');
      app.get('/throw-httpexception', () => {
        throw new HTTPException(status, { cause: { code } });
      });

      const res = await app.request('/api/throw-httpexception', { method: 'GET' }, env);

      expect(res.status).toBe(expectedStatus);
      expect(await res.json()).toEqual(body);
    },
  );
});
