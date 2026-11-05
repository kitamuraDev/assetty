import { createHonoApp } from './app';

import assets from './routes/assets';
import auth from './routes/auth';
import me from './routes/me';

// biome-ignore format: basePathとrouteを分けるために以下の形を維持する
const app = createHonoApp().basePath('/api')
  .route('/auth', auth)
  .route('/me', me)
  .route('/assets', assets);

export default app;
