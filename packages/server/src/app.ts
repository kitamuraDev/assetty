import { type DrizzleD1Database, drizzle } from 'drizzle-orm/d1';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { errorHandlingMiddleware } from './middleware/error';

export type Env = {
  Bindings: CloudflareBindings;
  Variables: {
    d1: DrizzleD1Database;
    userId: string;
  };
};

export const createHonoApp = () => {
  const app = new Hono<Env>();

  app.use(
    '/api/*',
    cors({
      origin: ['http://localhost:4200', 'https://assetty-web.kitamuradev.workers.dev'],
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
    }),
  );

  app.use(async (c, next) => {
    c.set('d1', drizzle(c.env.ASSETTY_D1));
    await next();
  });

  app.onError(errorHandlingMiddleware);

  return app;
};
