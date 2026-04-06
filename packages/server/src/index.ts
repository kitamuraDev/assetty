import { createHonoApp } from './app';
import auth from './features/auth/auth.route';
import user from './features/user/user.route';
import { jwtAuthMiddleware } from './middleware/auth';

const app = createHonoApp().basePath('/api');
app.use('/user', jwtAuthMiddleware); // アクセストークンの検証（認可制御）

app.route('/auth', auth);
app.route('/user', user);

export default app;
