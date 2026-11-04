import { createHonoApp } from './app';

import assets from './features/assets/assets.route';
import auth from './features/auth/auth.route';
import me from './features/me/me.route';

// biome-ignore format: basePathとrouteを分けるために以下の形を維持する
const app = createHonoApp().basePath('/api')
  .route('/auth', auth)
  .route('/me', me)
  .route('/assets', assets);

export default app;
