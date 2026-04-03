import type { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import { HTTPException } from 'hono/http-exception';
import { verify } from 'hono/jwt';
import type { Env } from '../app';
import type { ErrorCause } from './error';

export const jwtAuthMiddleware = async (c: Context<Env>, next: Next) => {
  const token = getCookie(c, c.env.JWT_ACCESS_TOKEN);
  if (!token) {
    throw new HTTPException(401, { cause: 'INVALID_ACCESS_TOKEN' satisfies ErrorCause });
  }

  try {
    const payload = await verify(token, c.env.JWT_SECRET_KEY, {
      alg: 'HS256',
      aud: c.env.JWT_AUDIENCE,
      iss: c.env.JWT_ISSUER,
    });
    c.set('userId', payload['sub'] as string);

    await next();
  } catch (_e) {
    throw new HTTPException(401, { cause: 'INVALID_ACCESS_TOKEN' satisfies ErrorCause });
  }
};
