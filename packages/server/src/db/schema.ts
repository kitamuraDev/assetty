import { sql } from 'drizzle-orm';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
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
