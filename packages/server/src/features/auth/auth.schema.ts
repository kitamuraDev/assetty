import type { LoginRequestBodyType } from '@api-spec/api-types';
import { type GenericSchema, nonEmpty, object, pipe, string } from 'valibot';
import { getMissingKeyValidationMessage } from '../../validation/messages';

export const LoginRequestBodySchema = object(
  {
    name: pipe(string(), nonEmpty('ユーザーネームは必須です')),
    password: pipe(string(), nonEmpty('パスワードは必須です')),
  },
  getMissingKeyValidationMessage,
) satisfies GenericSchema<LoginRequestBodyType>;
