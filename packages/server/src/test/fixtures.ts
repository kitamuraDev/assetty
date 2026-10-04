import type { CreateAssetRecordsRequestBodyType } from '@api-spec/api-types';
import bcrypt from 'bcryptjs';
import { drizzle } from 'drizzle-orm/d1';
import { assetCategories, monthlyAssets, users } from '../db/schema';

type BaseParam = { d1Database: D1Database };

export type InsertUserType = {
  id: string;
  name: string;
  password: string;
};

type YearMonth = `${number}${number}${number}${number}-${number}${number}`;
type CreateAssetsOptions = {
  from: YearMonth;
  to: YearMonth;
  assetCategoryIds: number[];
};

/**
 * usersテーブルのデータをリセットして、テストデータを挿入する
 * @param d1Database テスト対象のD1データベース
 * @param user 登録するユーザー
 */
export const seedTestUser = async ({ d1Database, user }: BaseParam & { user: InsertUserType }) => {
  const d1 = drizzle(d1Database);

  await d1.delete(monthlyAssets);
  await d1.delete(users);

  await d1.insert(users).values({
    id: user.id,
    name: user.name,
    password: await bcrypt.hash(user.password, 12),
  });
};

/**
 * assetCategoriesテーブルのデータをリセットして、テストデータを挿入する
 * @param d1Database テスト対象のD1データベース
 */
export const seedTestAssetCategories = async ({ d1Database }: BaseParam) => {
  const d1 = drizzle(d1Database);

  await d1.delete(monthlyAssets);
  await d1.delete(assetCategories);

  await d1.insert(assetCategories).values([
    { id: 1, name: '現金' },
    { id: 2, name: '債券' },
    { id: 3, name: '国内株式' },
    { id: 4, name: '海外株式' },
    { id: 5, name: '投資信託' },
    { id: 6, name: '現物不動産' },
    { id: 7, name: 'REIT' },
    { id: 8, name: 'コモディティ' },
    { id: 9, name: '暗号資産' },
    { id: 10, name: '年金' },
    { id: 11, name: '保険' },
    { id: 12, name: 'その他' },
  ]);
};

/**
 * monthlyAssetsテーブルのデータをリセットして、テストデータを挿入する
 * @param d1Database テスト対象のD1データベース
 * @param userId テストデータのユーザーID
 * @param assets 登録する資産情報
 */
export const seedTestAssets = async ({
  d1Database,
  userId,
  assets,
}: BaseParam & { userId: string } & { assets: CreateAssetRecordsRequestBodyType }) => {
  const d1 = drizzle(d1Database);

  await d1.delete(monthlyAssets);

  // D1は1クエリあたりバインド変数100個までのため、1件4変数のデータを25件ずつ挿入する
  // @see https://developers.cloudflare.com/d1/platform/limits/
  const insertValues = assets.map((asset) => ({ ...asset, userId }));
  for (let i = 0; i < insertValues.length; i += 25) {
    await d1.insert(monthlyAssets).values(insertValues.slice(i, i + 25));
  }
};

/**
 * 資産データを作成する
 * @param from 開始年月（YYYY-MM形式）
 * @param to 終了年月（YYYY-MM形式）
 * @param assetCategoryIds 資産カテゴリIDの配列
 * @returns 資産データ
 */
export const createTestAssets = ({ from, to, assetCategoryIds }: CreateAssetsOptions) => {
  const start = new Date(`${from}-01T00:00:00Z`);
  const end = new Date(`${to}-01T00:00:00Z`);
  const monthCount = (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + end.getUTCMonth() - start.getUTCMonth() + 1;

  return Array.from({ length: monthCount }).flatMap((_, monthIndex) => {
    const date = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + monthIndex, 1))
      .toISOString()
      .slice(0, 10);

    return assetCategoryIds.map((assetCategoryId) => ({
      date,
      amount: assetCategoryId * 100_000 + monthIndex * 1_000,
      assetCategoryId,
    }));
  });
};
