import type { ErrorResponseType } from '@api-spec/api-types';
import { sValidator } from '@hono/standard-validator';
import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { HTTPResponseError, ValidationTargets } from 'hono/types';
import type { BaseIssue, BaseSchema, BaseSchemaAsync } from 'valibot';
import type { Env } from '../app';

export type ErrorCause = Exclude<ErrorResponseType['code'], 'INTERNAL_SERVER_ERROR'>; // INTERNAL_SERVER_ERROR は明示的にthrowしないため除外

/**
 * 共通エラーハンドリングを管理するミドルウェア
 * @param error 発生したエラー
 * @param c Honoコンテキスト
 * @returns エラーレスポンス
 */
export const errorHandlingMiddleware = (
  error: Error | HTTPResponseError,
  c: Context<Env>,
): ReturnType<typeof c.json<ErrorResponseType>> => {
  const cause = error.cause as ErrorCause;

  if (error instanceof HTTPException) {
    switch (cause) {
      case 'VALIDATION_ERROR':
        return c.json({ code: 'VALIDATION_ERROR', message: 'Validation Error' }, 400);
      case 'INVALID_CREDENTIALS':
        return c.json({ code: 'INVALID_CREDENTIALS', message: 'Invalid Credentials' }, 401);
      case 'INVALID_ACCESS_TOKEN':
        return c.json({ code: 'INVALID_ACCESS_TOKEN', message: 'Invalid Access Token' }, 401);
      case 'NOT_FOUND':
        return c.json({ code: 'NOT_FOUND', message: 'Not Found' }, 404);
      case 'ASSETS_REGISTRATION_FAILED':
        return c.json({ code: 'ASSETS_REGISTRATION_FAILED', message: 'Assets Registration Failed' }, 500);
      default:
        throw new Error(cause satisfies never);
    }
  }

  // 予期しないサーバーエラー
  return c.json({ code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' }, 500);
};

/**
 * valibotのバリデーションエラーをカスタムエラーに変換するミドルウェア
 * @param target バリデーション対象の種類
 * @param schema Valibotスキーマ
 * @returns 成功: バリデーション済みのデータ、失敗: HTTPExceptionをthrow
 */
export const customValidationErrorMiddleware = <
  // TODO: any型を使わない適切な型定義に直したい。ValibotのObjectSchema型が渡ってくるから、その辺の型を使えばany型を使わずに済むはず..
  // biome-ignore lint: no-explicit-any
  TSchema extends BaseSchema<unknown, any, BaseIssue<unknown>> | BaseSchemaAsync<unknown, any, BaseIssue<unknown>>,
>(
  target: keyof ValidationTargets,
  schema: TSchema,
) => {
  return sValidator(target, schema, (result, _c) => {
    if (result.success) return result.data;
    throw new HTTPException(400, { cause: 'VALIDATION_ERROR' satisfies ErrorCause });
  });
};
