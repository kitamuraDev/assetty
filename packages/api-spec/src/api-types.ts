import type { components } from './schema';

// ====================================================================================================
// requestBodies
// ====================================================================================================
export type LoginRequestBodyType = components['requestBodies']['LoginRequestBody']['content']['application/json'];
export type CreateAssetRecordsRequestBodyType =
  components['requestBodies']['CreateAssetRecordsRequestBody']['content']['application/json'];

// ====================================================================================================
// parameters
// ====================================================================================================
export type BaseDateQueryParameterType = components['parameters']['BaseDateQueryParameter'];

// ====================================================================================================
// schemas
// ====================================================================================================
export type ErrorResponseType = components['schemas']['ErrorResponse'];
export type LoginSuccessResponseType = components['schemas']['LoginSuccessResponse'];
export type AuthCheckResponseType = components['schemas']['AuthCheckResponse'];
export type UserInfoResponseType = components['schemas']['UserInfoResponse'];
export type AssetCategoryResponseType = components['schemas']['AssetCategoryResponse'];
export type AssetInfoResponseType = components['schemas']['AssetInfoResponse'];
export type CreateAssetRecordsSuccessResponseType = components['schemas']['CreateAssetRecordsSuccessResponse'];

// ====================================================================================================
// 派生型
// ====================================================================================================
// statusを除外した型を定義。statusはHTTPステータスコードを返すため、bodyには含めない
export type ErrorResponseBodyType<T = ErrorResponseType> = T extends { status: number } ? Omit<T, 'status'> : never;
