import type { ErrorDetailsType, ErrorResponseBodyType, ErrorResponseType } from '@api-spec/api-types';
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
): ReturnType<typeof c.json<ErrorResponseBodyType>> => {
  if (error instanceof HTTPException) {
    const { code, errors } = error.cause as ErrorCause;
    const response = ERROR_RESPONSE[code];

    return c.json(
      { code: response.code, title: response.title, message: response.message, errors } as ErrorResponseBodyType, // TODO: as typeじゃなくて綺麗な型定義で解決したい
      response.status,
    );
  }

  // 予期しないサーバーエラー
  const response = ERROR_RESPONSE.INTERNAL_SERVER_ERROR;
  return c.json({ code: response.code, title: response.title, message: response.message }, response.status);
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

    const errors = [...new Set(result.error.map((e) => e.message))].map((message) => ({ message })); // messageの重複を除外してErrorDetailsTypeに変換
    throw new HTTPException(400, { cause: { code: 'VALIDATION_ERROR', errors } satisfies ErrorCause });
  });
};
