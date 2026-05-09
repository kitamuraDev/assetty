import type { AssetsInfoResponseType, BaseDateParameterType } from '@api-spec/shared/assets.schema';
import { type GenericSchema, isoDate, nonEmpty, object, pipe, string } from 'valibot';

export const AssetsRequestQuerySchema = object({
  baseDate: pipe(string(), isoDate(), nonEmpty('基準日は必須です')),
}) satisfies GenericSchema<{ baseDate: BaseDateParameterType }>;

export type AssetsInfoQueryResponseType = {
  year_month: AssetsInfoResponseType['yearMonth'];
  total_assets: AssetsInfoResponseType['totalAssets'];
  assets_by_categories: string;
};
