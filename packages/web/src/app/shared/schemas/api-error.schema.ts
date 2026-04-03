import { HttpErrorResponse } from '@angular/common/http';
import type { ErrorResponse } from '@api-spec/shared/error.schema';
import { type GenericSchema, instance, object, picklist, pipe, safeParse, transform } from 'valibot';

const ErrorCodeList = [
  'INVALID_CREDENTIALS',
  'INVALID_ACCESS_TOKEN',
  'INVALID_RESPONSE_DATA',
  'NOT_FOUND',
  'INTERNAL_SERVER_ERROR',
] as const satisfies ErrorResponse['code'][];
const ErrorMessageList = [
  'Invalid Credentials',
  'Invalid Access Token',
  'Invalid Response Data',
  'Not Found',
  'Internal Server Error',
] as const satisfies ErrorResponse['message'][];

const ErrorResponseSchema = object({
  code: picklist(ErrorCodeList),
  message: picklist(ErrorMessageList),
}) satisfies GenericSchema<ErrorResponse>;

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
