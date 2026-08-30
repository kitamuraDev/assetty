import { HttpErrorResponse } from '@angular/common/http';
import type { ErrorResponseType } from '@api-spec/api-types';
import { type GenericSchema, instance, object, picklist, pipe, safeParse, transform } from 'valibot';

const ErrorCodeList = [
  'VALIDATION_ERROR',
  'INVALID_CREDENTIALS',
  'INVALID_ACCESS_TOKEN',
  'NOT_FOUND',
  'ASSETS_REGISTRATION_FAILED',
  'INTERNAL_SERVER_ERROR',
] as const satisfies ErrorResponseType['code'][];
const ErrorMessageList = [
  'Validation Error',
  'Invalid Credentials',
  'Invalid Access Token',
  'Not Found',
  'Assets Registration Failed',
  'Internal Server Error',
] as const satisfies ErrorResponseType['message'][];

const ErrorResponseSchema = object({
  code: picklist(ErrorCodeList),
  message: picklist(ErrorMessageList),
}) satisfies GenericSchema<ErrorResponseType>;

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
