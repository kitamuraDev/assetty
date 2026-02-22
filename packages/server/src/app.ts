import { type DrizzleD1Database, drizzle } from 'drizzle-orm/d1';
import { Hono } from 'hono';

export type Env = {
  Bindings: CloudflareBindings;
  Variables: {
    d1: DrizzleD1Database;
  };
};

export const createHonoApp = () => {
  const app = new Hono<Env>();

  app.use(async (c, next) => {
    c.set('d1', drizzle(c.env.ASSETTY_D1));
    await next();
  });

  return app;
};
