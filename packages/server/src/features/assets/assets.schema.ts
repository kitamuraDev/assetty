import type { AssetsRequestQueryParametersType, CreateAssetRecordsRequestBodyType } from '@api-spec/api-types';
import {
  array,
  check,
  endsWith,
  type GenericSchema,
  integer,
  isoDate,
  literal,
  maxValue,
  minValue,
  nonEmpty,
  number,
  object,
  pipe,
  string,
  transform,
  union,
} from 'valibot';
import { getMissingKeyValidationMessage } from '../../validation/messages';

export const AssetsRequestQueryParameterSchema = object(
  {
    base_date: pipe(string(), isoDate('日付形式はYYYY-MM-DDである必要があります')),
    months_ago: pipe(
      string(),
      transform((v) => Number(v)),
      check((v) => !Number.isNaN(v), '取得月数は数値である必要があります'),
      number(),
      integer('取得月数は整数である必要があります'),
      minValue(12, '取得月数は12以上である必要があります'),
      maxValue(60, '取得月数は60以下である必要があります'),
    ),
    year_end_only: pipe(
      union([literal('true'), literal('false')], '年次フラグはtrueまたはfalseである必要があります'),
      transform((v) => v === 'true'),
    ),
  },
  getMissingKeyValidationMessage,
) satisfies GenericSchema<AssetsRequestQueryParametersType>;

export const CreateAssetRecordsRequestBodySchema = array(
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
