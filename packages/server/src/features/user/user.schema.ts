import type { UserInfoResponseType } from '@api-spec/shared/user.schema';
import { type GenericSchema, nanoid, object, pipe, string } from 'valibot';

export const ResponseUserInfoSchema = object({
  id: pipe(string(), nanoid()),
  name: string(),
}) satisfies GenericSchema<UserInfoResponseType>;
