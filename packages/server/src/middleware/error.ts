import type { ErrorResponseBodyType, ErrorResponseType } from '@api-spec/api-types';
import { sValidator } from '@hono/standard-validator';
import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { HTTPResponseError, ValidationTargets } from 'hono/types';
import type { BaseIssue, BaseSchema, BaseSchemaAsync } from 'valibot';
import type { Env } from '../app';
import { ERROR_RESPONSE } from './error-response';

export type ErrorCode = Exclude<ErrorResponseType['code'], 'INTERNAL_SERVER_ERROR'>; // INTERNAL_SERVER_ERROR は明示的にthrowしないため除外

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
  const code = error.cause as ErrorCode;

  if (error instanceof HTTPException) {
    const response = ERROR_RESPONSE[code];
    return c.json({ code: response.code, message: response.message } as ErrorResponseBodyType, response.status); // TODO: as typeじゃなくて綺麗な型定義で解決したい
  }

  // 予期しないサーバーエラー
  const response = ERROR_RESPONSE.INTERNAL_SERVER_ERROR;
  return c.json({ code: response.code, message: response.message }, response.status);
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
    throw new HTTPException(400, { cause: 'VALIDATION_ERROR' satisfies ErrorCode });
  });
};
