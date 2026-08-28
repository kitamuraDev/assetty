import type { UserInfoResponseType } from '@api-spec/api-types';
import { eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { createHonoApp } from '../../app';
import { users } from '../../db/schema';
import { jwtAuthMiddleware } from '../../middleware/auth';
import type { ErrorCause } from '../../middleware/error';

const user = createHonoApp();
user.use('/*', jwtAuthMiddleware); // アクセストークンの検証

user.get('/', async (c): Promise<ReturnType<typeof c.json<UserInfoResponseType>>> => {
  const userId = c.get('userId');

  const d1 = c.get('d1');
  const result = await d1.select({ id: users.id, name: users.name }).from(users).where(eq(users.id, userId)).get();

  // 認証の先にあるAPIなので、論理的にはユーザが見つからないケースはないはずだが、防御的に404エラーを返しておく
  // ただし、今後「退会機能」を追加する場合は適切にアクセストークンの無効化を行わなければ、退会済みユーザーのアクセストークンでここまで到達できてしまうため要注意
  if (!result) {
    throw new HTTPException(404, { cause: 'NOT_FOUND' satisfies ErrorCause });
  }

  return c.json(result, 200);
});

export default user;
