import type { ErrorResponseType } from '@api-spec/api-types';

/**
 * エラー種別ごとのレスポンスを定義する定数
 */
export const ERROR_RESPONSE = {
  VALIDATION_ERROR: {
    status: 400,
    code: 'VALIDATION_ERROR',
    title: 'Validation Error',
    message: 'Validation Error',
  },
  INVALID_CREDENTIALS: {
    status: 401,
    code: 'INVALID_CREDENTIALS',
    title: 'Invalid Credentials',
    message: 'Invalid Credentials',
  },
  INVALID_ACCESS_TOKEN: {
    status: 401,
    code: 'INVALID_ACCESS_TOKEN',
    title: 'Invalid Access Token',
    message: 'Invalid Access Token',
  },
  NOT_FOUND: {
    status: 404,
    code: 'NOT_FOUND',
    title: 'Not Found',
    message: 'Not Found',
  },
  ASSETS_REGISTRATION_FAILED: {
    status: 500,
    code: 'ASSETS_REGISTRATION_FAILED',
    title: 'Assets Registration Failed',
    message: 'Assets Registration Failed',
  },
  INTERNAL_SERVER_ERROR: {
    status: 500,
    code: 'INTERNAL_SERVER_ERROR',
    title: 'Internal Server Error',
    message: 'Internal Server Error',
  },
} as const satisfies Record<ErrorResponseType['code'], ErrorResponseType>;
