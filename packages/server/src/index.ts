import type { paths } from '@api-spec/schema';
import { createHonoApp } from './app';
import auth from './features/auth/auth.route';
import { jwtAuthMiddleware } from './middleware/auth';

type Message = paths['/message']['get']['responses']['200']['content']['application/json'];

const app = createHonoApp().basePath('/api');
app.use('/message', jwtAuthMiddleware); // アクセストークンの検証（認可制御）

app.route('/auth', auth);
app.get('/message', (c): ReturnType<typeof c.json<Message>> => {
  return c.json({ message: 'Assetty' }, 200);
});

export default app;
