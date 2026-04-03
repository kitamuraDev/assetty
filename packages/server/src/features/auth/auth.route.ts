import type { AuthCheckResponseType, LoginSuccessResponseType } from '@api-spec/shared/auth.schema';
import { sValidator } from '@hono/standard-validator';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { deleteCookie, setCookie } from 'hono/cookie';
import { HTTPException } from 'hono/http-exception';
import { sign } from 'hono/jwt';
import type { JWTPayload } from 'hono/utils/jwt/types';

import { createHonoApp } from '../../app';
import { users } from '../../db/schema';
import { jwtAuthMiddleware } from '../../middleware/auth';
import type { ErrorCause } from '../../middleware/error';
import { LoginRequestBodySchema } from './auth.schema';

const auth = createHonoApp();

auth.post(
  '/login',
  sValidator('json', LoginRequestBodySchema),
  async (c): Promise<ReturnType<typeof c.json<LoginSuccessResponseType>>> => {
    const { name, password } = c.req.valid('json');

    const d1 = c.get('d1');
    const result = await d1.select().from(users).where(eq(users.name, name)).get();

    if (!result) {
      throw new HTTPException(401, { cause: 'INVALID_CREDENTIALS' satisfies ErrorCause });
    }

    const isPasswordMatch = await bcrypt.compare(password, result.password);
    if (!isPasswordMatch) {
      throw new HTTPException(401, { cause: 'INVALID_CREDENTIALS' satisfies ErrorCause });
    }

    const payload: JWTPayload = {
      sub: result.id,
      aud: c.env.JWT_AUDIENCE,
      iss: c.env.JWT_ISSUER,
      exp: Math.floor(Date.now() / 1000) + 60 * Number(c.env.JWT_EXPIRATION_MINUTES),
    };
    const jwt = await sign(payload, c.env.JWT_SECRET_KEY, 'HS256');

    setCookie(c, c.env.JWT_ACCESS_TOKEN, jwt, {
      httpOnly: true,
      sameSite: 'Strict',
      maxAge: 60 * Number(c.env.JWT_EXPIRATION_MINUTES),
    });

    return c.json({ name: result.name }, 200);
  },
);

auth.post('/logout', (c): ReturnType<typeof c.newResponse> => {
  deleteCookie(c, c.env.JWT_ACCESS_TOKEN, {
    httpOnly: true,
    sameSite: 'Strict',
  });

  return c.newResponse(null, 204);
});

auth.get('/check', jwtAuthMiddleware, (c): ReturnType<typeof c.json<AuthCheckResponseType>> => {
  return c.json({ ok: true });
});

export default auth;
