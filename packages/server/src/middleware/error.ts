import type { ErrorDetailsType, ErrorResponseType } from '@api-spec/api-types';
import { sValidator } from '@hono/standard-validator';
import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { HTTPResponseError, ValidationTargets } from 'hono/types';
import type { BaseIssue, BaseSchema, BaseSchemaAsync } from 'valibot';
import type { Env } from '../app';
import { ERROR_RESPONSE } from './error-response';

export type ErrorCode = Exclude<ErrorResponseType['code'], 'INTERNAL_SERVER_ERROR'>; // INTERNAL_SERVER_ERROR は明示的にthrowしないため除外
export type ErrorCause = { code: ErrorCode; errors?: ErrorDetailsType };

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
  if (error instanceof HTTPException) {
    const { code, errors } = error.cause as ErrorCause;
    const { status, ...body } = ERROR_RESPONSE[code];

    return c.json({ ...body, errors }, status);
  }

  // 予期しないサーバーエラー
  const { status, ...body } = ERROR_RESPONSE.INTERNAL_SERVER_ERROR;
  return c.json(body, status);
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

    const errors = result.error.map((e) => ({ message: e.message }));
    throw new HTTPException(400, { cause: { code: 'VALIDATION_ERROR', errors } satisfies ErrorCause });
  });
};
