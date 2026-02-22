import { eq } from 'drizzle-orm';
import { createHonoApp } from './app';
import { users } from './db/schema';

const app = createHonoApp().basePath('/api');
app.get('/users', async (c) => {
  const { name } = c.req.query();
  if (!name) {
    return c.json({ error: 'name is required' }, 400);
  }

  const d1 = c.get('d1');
  const result = await d1.select({ id: users.id, name: users.name }).from(users).where(eq(users.name, name)).get();

  if (!result) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json(result);
});

export default app;
