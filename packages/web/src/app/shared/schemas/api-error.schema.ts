import { HttpErrorResponse } from '@angular/common/http';
import type { ErrorDetailsType, ErrorResponseBodyType, ErrorResponseType } from '@api-spec/api-types';
import {
  array,
  type GenericSchema,
  instance,
  literal,
  object,
  optional,
  pipe,
  safeParse,
  string,
  transform,
  union,
} from 'valibot';

/**
 * エラー種別ごとのレスポンスを定義する定数
 */
export const ERROR_RESPONSE = {
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    title: 'Validation Error',
    message: 'Validation Error',
  },
  INVALID_CREDENTIALS: {
    code: 'INVALID_CREDENTIALS',
    title: 'Invalid Credentials',
    message: 'Invalid Credentials',
  },
  INVALID_ACCESS_TOKEN: {
    code: 'INVALID_ACCESS_TOKEN',
    title: 'Invalid Access Token',
    message: 'Invalid Access Token',
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    title: 'Not Found',
    message: 'Not Found',
  },
  ASSETS_REGISTRATION_FAILED: {
    code: 'ASSETS_REGISTRATION_FAILED',
    title: 'Assets Registration Failed',
    message: 'Assets Registration Failed',
  },
  INTERNAL_SERVER_ERROR: {
    code: 'INTERNAL_SERVER_ERROR',
    title: 'Internal Server Error',
    message: 'Internal Server Error',
  },
} as const satisfies Record<ErrorResponseType['code'], ErrorResponseBodyType>;

const ErrorDetailsSchema = array(object({ message: string() })) satisfies GenericSchema<ErrorDetailsType>;
const ErrorResponseSchema = union([
  ...Object.values(ERROR_RESPONSE).map(({ code, title, message }) =>
    object({
      code: literal(code),
      title: literal(title),
      message: literal(message),
      errors: optional(ErrorDetailsSchema),
    }),
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
