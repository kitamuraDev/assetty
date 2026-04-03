import type { ErrorResponse } from '@api-spec/shared/error.schema';
import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { HTTPResponseError } from 'hono/types';
import type { Env } from '../app';

export type ErrorCause = Exclude<ErrorResponse['code'], 'INTERNAL_SERVER_ERROR'>; // INTERNAL_SERVER_ERROR は明示的にthrowしないため除外

export const errorHandlingMiddleware = (
  error: Error | HTTPResponseError,
  c: Context<Env>,
): ReturnType<typeof c.json<ErrorResponse>> => {
  const cause = error.cause as ErrorCause;

  if (error instanceof HTTPException) {
    switch (cause) {
      case 'INVALID_CREDENTIALS':
        return c.json({ code: 'INVALID_CREDENTIALS', message: 'Invalid Credentials' }, 401);
      case 'INVALID_ACCESS_TOKEN':
        return c.json({ code: 'INVALID_ACCESS_TOKEN', message: 'Invalid Access Token' }, 401);
      case 'NOT_FOUND':
        return c.json({ code: 'NOT_FOUND', message: 'Not Found' }, 404);
      case 'INVALID_RESPONSE_DATA':
        return c.json({ code: 'INVALID_RESPONSE_DATA', message: 'Invalid Response Data' }, 500);
      default:
        throw new Error(cause satisfies never);
    }
  }

  // 予期しないサーバーエラー
  return c.json({ code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' }, 500);
};
