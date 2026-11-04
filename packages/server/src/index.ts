import { createHonoApp } from './app';
import assets from './features/assets/assets.route';
import auth from './features/auth/auth.route';
import me from './features/me/me.route';

const app = createHonoApp().basePath('/api');

app.route('/auth', auth);
app.route('/me', me);
app.route('/assets', assets);

export default app;
