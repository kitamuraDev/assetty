import { HttpErrorResponse } from '@angular/common/http';
import type { ErrorDetailsType, ErrorResponseType } from '@api-spec/api-types';
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
    title: '入力内容をご確認ください',
    message: '入力内容に誤りがあるため処理を完了できませんでした。各項目をご確認のうえ、再度お試しください。',
  },
  INVALID_CREDENTIALS: {
    code: 'INVALID_CREDENTIALS',
    title: 'ログイン情報をご確認ください',
    message:
      'ユーザー名またはパスワードが正しくないためログインできませんでした。入力内容をご確認のうえ、再度お試しください。',
  },
  INVALID_ACCESS_TOKEN: {
    code: 'INVALID_ACCESS_TOKEN',
    title: 'ログイン状態をご確認ください',
    message: '認証情報が無効または期限切れのため処理を続行できませんでした。再度ログインしてからお試しください。',
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    title: '対象の情報をご確認ください',
    message:
      '指定された情報は見つからないか、すでに削除されています。指定された内容をご確認のうえ、再度お試しください。',
  },
  ASSETS_REGISTRATION_FAILED: {
    code: 'ASSETS_REGISTRATION_FAILED',
    title: '資産情報の登録を再度お試しください',
    message:
      '資産情報の登録中に問題が発生しました。しばらく時間をおいてから再度お試しください。解決しない場合は、管理者にお問い合わせください。',
  },
  INTERNAL_SERVER_ERROR: {
    code: 'INTERNAL_SERVER_ERROR',
    title: '時間をおいて再度お試しください',
    message:
      'サーバーで予期しない問題が発生したため処理を完了できませんでした。しばらく時間をおいてから再度お試しください。解決しない場合は、管理者にお問い合わせください。',
  },
} as const satisfies Record<ErrorResponseType['code'], ErrorResponseType>;

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
