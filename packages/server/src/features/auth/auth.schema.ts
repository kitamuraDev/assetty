import type { LoginRequestBodyType } from '@api-spec/shared/auth.schema';
import { type GenericSchema, nonEmpty, object, pipe, string } from 'valibot';

export const LoginRequestBodySchema = object({
  name: pipe(string(), nonEmpty('ユーザーネームは必須です')),
  password: pipe(string(), nonEmpty('パスワードは必須です')),
}) satisfies GenericSchema<LoginRequestBodyType>;
