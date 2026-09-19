import type { BaseDateQueryParameterType, CreateAssetRecordsRequestBodyType } from '@api-spec/api-types';
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
import { getMissingKeyValidationMessage } from '../../validation/messages';

export const AssetsRequestQuerySchema = object(
  {
    baseDate: pipe(string(), isoDate('日付形式はYYYY-MM-DDである必要があります'), nonEmpty('基準日は必須です')),
  },
  getMissingKeyValidationMessage,
) satisfies GenericSchema<{ baseDate: BaseDateQueryParameterType }>;

export const CreateAssetsRequestBodySchema = array(
  object(
    {
      date: pipe(
        string(),
        isoDate('日付形式はYYYY-MM-DDである必要があります'),
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
    },
    getMissingKeyValidationMessage,
  ),
) satisfies GenericSchema<CreateAssetRecordsRequestBodyType>;
