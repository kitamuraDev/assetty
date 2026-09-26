import { applyD1Migrations } from 'cloudflare:test';
import { env } from 'cloudflare:workers';

await applyD1Migrations(env.ASSETTY_D1, env.TEST_MIGRATIONS);
