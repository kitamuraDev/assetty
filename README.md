# assetty

TODO: アプリの説明を記載する（何ができるのか）

## 技術スタック

## セットアップ手順

## リリースタグ更新

1. `package.json(root) > version`を更新
2. `git commit`
3. `git tag vn.n.n`
4. `git push origin main --tags`

## 環境構築手順

- [x] `git init`
- [x] `mise use bun@latest`
- [x] `bun init`
- root
  - [x] package.jsonの整備
  - [x] index.tsの削除（不要なので）
  - [x] pre-commit環境を構築（lefthook, biome）
- web
  - [x] `bun create @angular web`
  - [x] プロジェクト整備（不要なファイルの削除など）
  - [x] `wrangler.jsonc`を手動で作成（これがないとworkersにデプロイできない）
- server
  - [x] `bun create cloudflare@latest`
  - [x] プロジェクト整備（不要なファイルの削除など）
  - [x] D1 + Drizzle 環境構築
  - [x] D1からデータを取得&レスポンスをするサンプルを書く
- api-spec
  - [x] `bun init`
  - [x] プロジェクト整備（不要なファイルの削除など）
- [x] 全体見直し
- [x] pre-commit時にテスト/リント/フォーマットが期待通りに動くこと
- [ ] デプロイして本番環境でも問題なく動くか確認
- [ ] README.md/AGENTS.mdの整備

## モノレポ採用理由
