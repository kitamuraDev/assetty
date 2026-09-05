import { HttpErrorResponse } from '@angular/common/http';
import type { ErrorResponseBodyType, ErrorResponseType } from '@api-spec/api-types';
import { instance, literal, object, pipe, safeParse, transform, union } from 'valibot';

/**
 * エラー種別ごとのレスポンスを定義する定数
 */
export const ERROR_RESPONSE = {
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    message: 'Validation Error',
  },
  INVALID_CREDENTIALS: {
    code: 'INVALID_CREDENTIALS',
    message: 'Invalid Credentials',
  },
  INVALID_ACCESS_TOKEN: {
    code: 'INVALID_ACCESS_TOKEN',
    message: 'Invalid Access Token',
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    message: 'Not Found',
  },
  ASSETS_REGISTRATION_FAILED: {
    code: 'ASSETS_REGISTRATION_FAILED',
    message: 'Assets Registration Failed',
  },
  INTERNAL_SERVER_ERROR: {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Internal Server Error',
  },
} as const satisfies Record<ErrorResponseType['code'], ErrorResponseBodyType>;

const ErrorResponseSchema = union([
  ...Object.values(ERROR_RESPONSE).map(({ code, message }) =>
    object({ code: literal(code), message: literal(message) }),
  ),
]);

/**
 * Angular の HttpErrorResponse を、API 定義に基づいたエラー形式に変換・検証するスキーマ
 *
 * - 入力: Angular の HttpErrorResponse インスタンス
 * - 出力:
 *  - `original`: 元の HttpErrorResponse
 *  - `body`: API 定義（ErrorResponseSchema）に適合したエラー情報。適合しない場合は null
 */
export const HttpErrorResponseSchema = pipe(
  instance(HttpErrorResponse),
  transform((e) => {
    const parsed = safeParse(ErrorResponseSchema, e.error);

    return {
      original: e,
      body: parsed.success ? parsed.output : null,
    };
  }),
);
