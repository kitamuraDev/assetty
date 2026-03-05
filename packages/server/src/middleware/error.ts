import type { components } from '@api-spec/schema';
import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { HTTPResponseError } from 'hono/types';
import type { Env } from '../app';

export type ErrorCause = Exclude<components['schemas']['ErrorResponse']['code'], 'INTERNAL_SERVER_ERROR'>; // INTERNAL_SERVER_ERROR は明示的にthrowしないため除外
type ErrorResponse = components['schemas']['ErrorResponse'];

export const errorHandlingMiddleware = (error: Error | HTTPResponseError, c: Context<Env>) => {
  const cause = error.cause as ErrorCause;

  if (error instanceof HTTPException) {
    switch (cause) {
      case 'INVALID_CREDENTIALS':
        return c.json({ code: 'INVALID_CREDENTIALS', message: 'Invalid Credentials' } satisfies ErrorResponse, 401);
      case 'INVALID_TOKEN':
        return c.json({ code: 'INVALID_TOKEN', message: 'Invalid Token' } satisfies ErrorResponse, 401);
      case 'NOT_FOUND':
        return c.json({ code: 'NOT_FOUND', message: 'Not Found' } satisfies ErrorResponse, 404);
      case 'INVALID_RESPONSE_DATA':
        return c.json({ code: 'INVALID_RESPONSE_DATA', message: 'Invalid Response Data' } satisfies ErrorResponse, 500);
      default:
        throw new Error(cause satisfies never);
    }
  }

  // 予期しないサーバーエラー
  return c.json({ code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' } satisfies ErrorResponse, 500);
};
