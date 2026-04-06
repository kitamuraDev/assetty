import type { UserInfoResponseType } from '@api-spec/shared/user.schema';
import { eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { safeParse } from 'valibot';
import { createHonoApp } from '../../app';
import { users } from '../../db/schema';
import type { ErrorCause } from '../../middleware/error';
import { ResponseUserInfoSchema } from './user.schema';

const user = createHonoApp();

user.get('/', async (c): Promise<ReturnType<typeof c.json<UserInfoResponseType>>> => {
  const userId = c.get('userId');

  const d1 = c.get('d1');
  const result = await d1.select().from(users).where(eq(users.id, userId)).get();

  // ※認証の先にあるAPIなので、論理的にはユーザが見つからないケースはないはずだが、もしもの場合を考慮して404エラーを返しておく
  if (!result) {
    throw new HTTPException(404, { cause: 'NOT_FOUND' satisfies ErrorCause });
  }

  const parsed = safeParse(ResponseUserInfoSchema, result);
  if (!parsed.success) {
    throw new HTTPException(500, { cause: 'INVALID_RESPONSE_DATA' satisfies ErrorCause });
  }

  return c.json(parsed.output, 200);
});

export default user;
