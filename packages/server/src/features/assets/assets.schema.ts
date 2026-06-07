import type {
  AssetsInfoResponseType,
  BaseDateParameterType,
  CreateAssetsRequestBodyType,
} from '@api-spec/shared/assets.schema';
import {
  array,
  endsWith,
  type GenericSchema,
  integer,
  isoDate,
  minValue,
  nonEmpty,
  number,
  object,
  pipe,
  string,
} from 'valibot';

export const AssetsRequestQuerySchema = object({
  baseDate: pipe(string(), isoDate(), nonEmpty('基準日は必須です')),
}) satisfies GenericSchema<{ baseDate: BaseDateParameterType }>;

export type AssetsInfoQueryResponseType = {
  year_month: AssetsInfoResponseType['yearMonth'];
  total_assets: AssetsInfoResponseType['totalAssets'];
  assets_by_categories: string;
};

export const CreateAssetsRequestBodySchema = array(
  object({
    date: pipe(
      string(),
      isoDate(),
      nonEmpty('日付は必須です'),
      endsWith('-01', '月初日（YYYY-MM-01形式）である必要があります'),
    ),
    amount: pipe(
      number('金額は数値である必要があります'),
      integer('金額は整数である必要があります'),
      minValue(1, '金額は1以上である必要があります'),
    ),
    assetCategoryId: pipe(
      number('資産カテゴリIDは数値である必要があります'),
      integer('資産カテゴリIDは整数である必要があります'),
      minValue(1, '資産カテゴリIDは1以上である必要があります'),
    ),
  }),
) satisfies GenericSchema<CreateAssetsRequestBodyType>;
