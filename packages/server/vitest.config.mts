import path from 'node:path';
import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-plugin';
import { defineConfig } from 'vitest/config';

export default defineConfig(async () => {
  // Drizzleのマイグレーションを読み込み、テスト用D1に適用するデータを準備する
  const migrationsPath = path.join(import.meta.dirname, 'drizzle');
  const migrations = await readD1Migrations(migrationsPath);

  return {
    test: {
      // テスト内でVitestのAPIをグローバルに利用する
      globals: true,
      // テスト結果を詳細に出力する
      reporters: ['verbose'],
      // テストファイルを並列実行する
      fileParallelism: true,
      // ファイル変更を監視する
      watch: true,
      // テスト開始前にDBマイグレーションを適用する
      setupFiles: ['./src/test/apply-migrations.ts'],
    },
    plugins: [
      cloudflareTest({
        wrangler: { configPath: './wrangler.jsonc' },
        miniflare: {
          bindings: { TEST_MIGRATIONS: migrations },
        },
      }),
    ],
  };
});
