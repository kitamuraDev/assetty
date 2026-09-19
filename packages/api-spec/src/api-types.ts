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
export type AssetsRequestQueryParameterType = components['parameters']['AssetsRequestQueryParameter'];

// ====================================================================================================
// schemas
// ====================================================================================================
export type ErrorDetailsType = components['schemas']['ErrorDetails'];
export type ErrorResponseType = components['schemas']['ErrorResponse'];
export type LoginSuccessResponseType = components['schemas']['LoginSuccessResponse'];
export type AuthCheckResponseType = components['schemas']['AuthCheckResponse'];
export type UserInfoResponseType = components['schemas']['UserInfoResponse'];
export type AssetCategoryResponseType = components['schemas']['AssetCategoryResponse'];
export type AssetInfoResponseType = components['schemas']['AssetInfoResponse'];
export type CreateAssetRecordsSuccessResponseType = components['schemas']['CreateAssetRecordsSuccessResponse'];
