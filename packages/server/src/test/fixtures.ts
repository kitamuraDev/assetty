import bcrypt from 'bcryptjs';
import { drizzle } from 'drizzle-orm/d1';
import { users } from '../db/schema';

type BaseParam = { d1Database: D1Database };

export type InsertUserType = {
  id: string;
  name: string;
  password: string;
};

/**
 * usersテーブルのデータをリセットして、テストデータを挿入する
 * @param d1Database テスト対象のD1データベース
 * @param user 登録するテストユーザー
 */
export const resetUsersAndSeedTestUser = async ({ d1Database, user }: BaseParam & { user: InsertUserType }) => {
  const d1 = drizzle(d1Database);

  await d1.delete(users);

  await d1.insert(users).values({
    id: user.id,
    name: user.name,
    password: await bcrypt.hash(user.password, 12),
  });
};
