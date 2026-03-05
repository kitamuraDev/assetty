import type { paths } from '@api-spec/schema';
import { sValidator } from '@hono/standard-validator';
import { eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { type GenericSchema, maxLength, minLength, nanoid, object, pipe, safeParse, string } from 'valibot';

import { createHonoApp } from './app';
import { users } from './db/schema';
import type { ErrorCause } from './middleware/error';

// インプット（クエリパラメータ）
type UserNameQueryType = paths['/users']['get']['parameters']['query'];
const UserNameQuerySchema = object({
  name: pipe(
    string(),
    minLength(1, 'ユーザー名は1文字以上である必要があります'),
    maxLength(30, 'ユーザー名は30文字以下である必要があります'),
  ),
}) satisfies GenericSchema<UserNameQueryType>;

// アウトプット（レスポンスボディ）
type UserResponseType = paths['/users']['get']['responses']['200']['content']['application/json'];
const UserResponseSchema = object({
  id: pipe(string(), nanoid()),
  name: string(),
}) satisfies GenericSchema<UserResponseType>;

const app = createHonoApp().basePath('/api');
app.get('/users', sValidator('query', UserNameQuerySchema), async (c) => {
  const { name } = c.req.valid('query');

  const d1 = c.get('d1');
  const result = await d1.select({ id: users.id, name: users.name }).from(users).where(eq(users.name, name)).get();

  if (!result) {
    throw new HTTPException(404, { cause: 'NOT_FOUND' satisfies ErrorCause });
  }

  const parsed = safeParse(UserResponseSchema, result);
  if (!parsed.success) {
    throw new HTTPException(500, { cause: 'INVALID_RESPONSE_DATA' satisfies ErrorCause });
  }

  return c.json(parsed.output, 200);
});

export default app;
