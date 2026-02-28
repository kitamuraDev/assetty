# assetty

TODO: ここにアプリの説明を記載する（何ができるのか）

## セットアップについて

### 前提

1. `mise` をインストールする
2. `mise install` で `bun` をインストールする

### 手順

1. プロジェクトルートにて `bun i` を実行して全パッケージの依存関係をインストールする
2. `bun run dev` を実行して開発サーバを立ち上げる

## リリースタグ更新

1. `package.json(root)` > `version` を更新
2. `git commit`
3. `git tag vn.n.n`
4. `git push origin main --tags`

## 環境構築について

`root` → `web` → `server` → `api-spec` の順番で構築を進める

### 手順

#### root

1. `git init`
2. `mise use bun@latest`
    - `bun@latest` のインストール
    - `mise.toml` の生成
3. `bun init`
4. package.json の整備
    - workspaces の設定
    - メタ情報（description や version など）の設定
5. プロジェクト整備
    - `tsconfig.json` の設定
    - 不要ファイルの削除など
6. pre-commit 環境を構築
    - lefthook
    - biome

#### web

1. `bun create @angular web`
2. プロジェクト整備
    - `tsconfig.json` の設定
    - 不要ファイルの削除など
3. `wrangler.jsonc` を手動で作成
    - これがないと workers にデプロイできない

#### server

1. `bun create cloudflare@latest server`
2. プロジェクト整備
    - `tsconfig.json` の設定
    - 不要ファイルの削除など
3. D1 + Drizzle 環境構築
    - [参考](https://github.com/kitamuraDev/crud-webapi-with-hono/blob/main/README.md)
    - 注意: D1のAPIトークン（`CLOUDFLARE_D1_TOKEN`）を作成するときは必ず `開始日` も設定すること
4. D1 と繋いで、データを取得&返却をするサンプルを書いて疎通確認する

#### api-spec

1. `bun init`
2. プロジェクト整備
    - `tsconfig.json` の設定
    - 不要ファイルの削除など
3. サンプルスキーマから `openapi-typescript` で型定義を生成できるか確認する
4. 3 で生成した型定義を `server` と `web` のどちらからか参照する設定を行い、参照できるか確認する

#### 最後に

1. pre-commit 時にテスト/リント/フォーマットが期待通りに動くか確認する
2. デプロイして本番環境でも問題なく動くか確認する
    - [server](https://dash.cloudflare.com/1bb29f99325f1fc901be8e1c2e58c5f6/workers/services/view/assetty-server/production/settings)
    - [web](https://dash.cloudflare.com/1bb29f99325f1fc901be8e1c2e58c5f6/workers/services/view/assetty-web/production/settings)
3. README.md / AGENTS.md の整備

## モノレポについて

### 採用理由

- FE/BEを1枚のリポジトリで管理できる
  - PJ全体の見通しが良くなる
  - AIもコンテキストが散らばっていないから把握しやすい
- FE/BEをまとめてコミットできる
  - APIの仕様変更が起きたときに、APIの提供者（BE）と利用者（FE）をまとめて更新して一緒にコミットすることができるのでPRが読みやすい & 背景も読み取りやすい
- 本当の意味で全検索が可能になるので、影響調査が正確 & やりやすい
- 依存関係を共有することができる
  - 複雑化しやすいことからデメリットにもなり得るが、用法要領を守ればメリットの部分だけを享受できる
- （両方でTS & Bunを使うため）1つのコマンドで両方の開発サーバを立ち上げることが可能になる

### 方針

- 依存関係の共有は行わない
  - ルートに `biome` と `lefthook` を入れているが、ルートから（GitHookによるpre-commitから）しか使わないためこのようなケースは例外扱いとする
  - バリデーションライブラリの `valibot` やテストライブラリの `vitest` をルートにインストールして、各パッケージから参照しに行くような運用はNG
  - 理由は、プロダクションコードと距離が近いようなライブラリはバージョンを更新する機会が多くあり、ルートで共有していると片方の都合だけでバージョンを更新することが困難になることが容易に予想されるためである
- 共有するのは「型定義」のみ
  - OpenAPIの仕様書から型を生成する `openapi-typescript` によって生成されたTypeScriptの型定義を格パッケージから参照するだけに留める
  - 第一級オブジェクト（プリミティブ値や配列や関数などのJavaScriptにおける、すべてのオブジェクト）を共有する運用はNG
  - 理由は、ビルドプロセスを含めた余計な複雑化を避けるためと、共有してはいけないオブジェクトを共有してしまうことで起こり得るセキュリティインシデントを避けるためである
  - TypeScriptの型定義であればランタイムには残らないため、生産性/保守性のために同一の型定義を格パッケージから参照することはモノレポの利点を上手く享受できる方針と考えられる
