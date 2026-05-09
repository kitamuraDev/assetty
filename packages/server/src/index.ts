import { createHonoApp } from './app';
import assets from './features/assets/assets.route';
import auth from './features/auth/auth.route';
import user from './features/user/user.route';

const app = createHonoApp().basePath('/api');

app.route('/auth', auth);
app.route('/user', user);
app.route('/assets', assets);

export default app;
