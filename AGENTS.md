# 基本方針

- 日本語で応答すること
- 必要に応じて、ユーザに質問を行い要求を明確にすること
- 技術スタックは以下の通り。各技術のバージョンや詳細については `package.json` を参照すること
- フレームワークやライブラリの使い方を聞かれたら必ず公式ドキュメントを参照すること
  - 公式ドキュメントのリンクはAGENTS.mdに記載しているため、そちらから参照する

## プロジェクト構成

- root
  - package.json
  - tsconfig.json
  - packages
    - api-spec
      - package.json
      - tsconfig.json
    - server
      - package.json
      - tsconfig.json
    - web
      - package.json
      - tsconfig.json

## 技術スタック

### root

- リンター/フォーマッター
  - [Biome](https://biomejs.dev/)
- CI（pre-commit）
  - [Lefthook](https://lefthook.dev/)

### api-spec

- OpenAPI型生成
  - [OpenAPI TypeScript](https://openapi-ts.dev/)

### server

- ランタイム
  - [Bun](https://bun.sh/)
- フレームワーク
  - [Hono](https://hono.dev/)
- デプロイ先
  - [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- 開発ツール
  - [Wrangler](https://developers.cloudflare.com/workers/wrangler/)
- データストア
  - [Cloudflare D1](https://developers.cloudflare.com/d1/)
- ORM
  - [Drizzle](https://orm.drizzle.team/)
- バリデーション
  - [Valibot](https://valibot.dev/)
- テスト
  - [Vitest](https://vitest.dev/)

### web

- ランタイム
  - [Bun](https://bun.sh/)
- フレームワーク
  - [Angular](https://angular.dev/)
- デプロイ先
  - [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- スタイリング
  - [Tailwind CSS](https://tailwindcss.com/)
- チャート
  - [ng2-charts](https://valor-software.com/ng2-charts/)
- テスト
  - [Vitest](https://vitest.dev/)
  - [Angular Testing Library](https://testing-library.com/docs/angular-testing-library/intro/)
