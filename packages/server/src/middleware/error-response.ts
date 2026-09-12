import type { ErrorResponseType } from '@api-spec/api-types';

/**
 * エラー種別ごとのレスポンスを定義する定数
 */
export const ERROR_RESPONSE = {
  VALIDATION_ERROR: {
    status: 400,
    code: 'VALIDATION_ERROR',
    title: '入力内容をご確認ください',
    message: '入力内容に誤りがあるため処理を完了できませんでした。各項目をご確認のうえ、再度お試しください。',
  },
  INVALID_CREDENTIALS: {
    status: 401,
    code: 'INVALID_CREDENTIALS',
    title: 'ログイン情報をご確認ください',
    message:
      'ユーザー名またはパスワードが正しくないためログインできませんでした。入力内容をご確認のうえ、再度お試しください。',
  },
  INVALID_ACCESS_TOKEN: {
    status: 401,
    code: 'INVALID_ACCESS_TOKEN',
    title: 'ログイン状態をご確認ください',
    message: '認証情報が無効または期限切れのため処理を続行できませんでした。再度ログインしてからお試しください。',
  },
  NOT_FOUND: {
    status: 404,
    code: 'NOT_FOUND',
    title: '対象の情報をご確認ください',
    message:
      '指定された情報は見つからないか、すでに削除されています。指定された内容をご確認のうえ、再度お試しください。',
  },
  ASSETS_REGISTRATION_FAILED: {
    status: 500,
    code: 'ASSETS_REGISTRATION_FAILED',
    title: '資産情報の登録を再度お試しください',
    message:
      '資産情報の登録中に問題が発生しました。しばらく時間をおいてから再度お試しください。解決しない場合は、管理者にお問い合わせください。',
  },
  INTERNAL_SERVER_ERROR: {
    status: 500,
    code: 'INTERNAL_SERVER_ERROR',
    title: '時間をおいて再度お試しください',
    message:
      'サーバーで予期しない問題が発生したため処理を完了できませんでした。しばらく時間をおいてから再度お試しください。解決しない場合は、管理者にお問い合わせください。',
  },
} as const satisfies Record<ErrorResponseType['code'], ErrorResponseType>;
