import type { components } from '../schema';

export type LoginRequestBodyType = components['requestBodies']['LoginRequestBody']['content']['application/json'];
export type LoginSuccessResponseType = components['schemas']['LoginSuccessResponse'];
export type AuthCheckResponseType = components['schemas']['AuthCheckResponse'];
