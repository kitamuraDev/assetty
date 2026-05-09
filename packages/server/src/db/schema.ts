import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { nanoid } from 'nanoid';

/**
 * ユーザーマスタ
 */
export const users = sqliteTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),
  name: text('name').unique().notNull(),
  password: text('password').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

/**
 * 資産カテゴリのマスタ
 */
export const assetCategories = sqliteTable('asset_categories', {
  id: integer('id').primaryKey(),
  name: text('name').unique().notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

/**
 * 月次の資産データ
 */
export const monthlyAssets = sqliteTable(
  'monthly_assets',
  {
    id: integer('id').primaryKey(),
    date: text('date').default(sql`(strftime('%Y-%m-01', CURRENT_TIMESTAMP))`).notNull(),
    amount: integer('amount').notNull(),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
    userId: text('user_id')
      .references(() => users.id)
      .notNull(),
    assetCategoryId: integer('asset_category_id')
      .references(() => assetCategories.id)
      .notNull(),
  },
  (table) => [
    // 複合UNIQUE(+index)制約: 同じユーザーが同じ月に同じカテゴリの資産を複数登録できないようにする
    uniqueIndex('monthly_assets_unique_idx').on(table.userId, table.date, table.assetCategoryId),
  ],
);
