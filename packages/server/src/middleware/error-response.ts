import type { ErrorResponseType } from '@api-spec/api-types';

/**
 * エラー種別ごとのレスポンスを定義する定数
 */
export const ERROR_RESPONSE = {
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    message: 'Validation Error',
    status: 400,
  },
  INVALID_CREDENTIALS: {
    code: 'INVALID_CREDENTIALS',
    message: 'Invalid Credentials',
    status: 401,
  },
  INVALID_ACCESS_TOKEN: {
    code: 'INVALID_ACCESS_TOKEN',
    message: 'Invalid Access Token',
    status: 401,
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    message: 'Not Found',
    status: 404,
  },
  ASSETS_REGISTRATION_FAILED: {
    code: 'ASSETS_REGISTRATION_FAILED',
    message: 'Assets Registration Failed',
    status: 500,
  },
  INTERNAL_SERVER_ERROR: {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Internal Server Error',
    status: 500,
  },
} as const satisfies Record<ErrorResponseType['code'], ErrorResponseType>;
