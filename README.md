# 福祉事業所向け業務ダッシュボード テンプレート

入所者情報・職員シフト・事故報告などをまとめて管理する福祉事業所向けダッシュボードのNext.jsテンプレートです。

> **⚠️ 重要**: このプロジェクトはプロダクション用ではなく、**PoCテンプレート**として提供されています。実際の運用環境で使用する前に、セキュリティ、認証、データ検証などを適切に実装してください。

## 概要

このプロジェクトは、福祉事業所（介護施設、デイサービスなど）の日常業務を効率化するためのダッシュボードテンプレートです。入所者管理、職員シフト、事故報告などの基本機能を備え、すぐに使い始められる状態で提供されています。

**主な特徴:**
- 🚀 フルスタックTypeScriptで型安全
- 🎨 モダンなUIデザイン（shadcn/ui）
- 🔄 リアルタイムデータ更新（TanStack Query）
- 🧪 テスト環境完備（Vitest）
- 🐳 Dockerで簡単デプロイ

## 技術スタック

- **フロントエンド**: Next.js 15 (App Router) + TypeScript
- **バックエンド**: tRPC + Next.js API Routes
- **データベース**: PostgreSQL + Prisma ORM
- **UI**: Tailwind CSS + shadcn/ui
- **状態管理**: TanStack Query (React Query)
- **テスト**: Vitest + Testing Library
- **コンテナ**: Docker + Docker Compose

## ドメインモデル

このアプリケーションは4つの主要なエンティティで構成されています：

### Resident (入所者)
入所者の基本情報と医療情報を管理。介護度（1-5）や入所状態を追跡します。

### Staff (職員)
職員の情報と役割を管理。看護師、介護士、ケアマネージャーなどの区分があります。

### Shift (シフト)
職員の勤務スケジュールを管理。早番、日勤、遅番、夜勤などの区分があります。

### Incident (事故・ヒヤリハット)
事故報告とヒヤリハットを記録。重要度と対応状態を追跡します。

**エンティティ間の関係:**
- Staff → Shift (1対多)
- その他のエンティティは現在独立していますが、将来的に関連付け可能

## 機能

- 📊 **ダッシュボード**: 入所者数、職員数、シフト状況、事故報告数の概要表示
- 👥 **入所者管理**:
  - ✅ 一覧表示
  - ✅ 新規登録（モーダルフォーム）
  - ✅ 詳細表示
  - ✅ 編集・更新
  - ✅ 削除
- 👔 **職員管理**: 職員の一覧表示と基本情報管理
- 📅 **シフト管理**: 月次カレンダーによるシフト表示
- ⚠️ **事故・ヒヤリハット管理**: 事故報告とヒヤリハットの記録管理

## セットアップ手順

### 方法1: Dockerを使用（推奨）

最も簡単な起動方法です。

#### 前提条件
- Docker Desktop がインストールされていること

#### 手順

```bash
# 1. リポジトリのクローン
git clone <repository-url>
cd welfare-ops-dashboard-template

# 2. 環境変数の設定（.env.exampleをコピー）
cp .env.example .env

# 3. Docker Composeで起動
docker compose up

# 別のターミナルで、データベースマイグレーションとシード実行
docker compose exec app npx prisma db push
docker compose exec app npm run db:seed
```

ブラウザで `http://localhost:3000` を開くとダッシュボードが表示されます。

#### デモデータ

seedスクリプトにより、以下のデータが自動的に投入されます：
- 入所者: 5名
- 職員: 5名
- シフト: 当月分（約90-120件）
- 事故報告: 4件

### 方法2: ローカル環境で実行

#### 前提条件
- Node.js 18以上
- PostgreSQL 14以上
- npm または yarn

#### 手順

```bash
# 1. リポジトリのクローン
git clone <repository-url>
cd welfare-ops-dashboard-template

# 2. 依存関係のインストール
npm install

# 3. データベースのセットアップ
psql -U postgres
CREATE DATABASE welfare_ops;
\q

# 4. 環境変数の設定
cp .env.example .env
# .envファイルを編集してDATABASE_URLを設定

# 5. Prismaクライアント生成とマイグレーション
npx prisma generate
npm run db:push

# 6. シードデータの投入
npm run db:seed

# 7. 開発サーバーの起動
npm run dev
```

ブラウザで `http://localhost:3000` を開くとダッシュボードが表示されます。

## データモデル

### Resident (入所者)

- 氏名、年齢、部屋番号
- 入所日、介護度
- 医療情報（オプション）

### Staff (職員)

- 氏名、役職、メールアドレス
- 電話番号、入社日
- 稼働状態

### Shift (シフト)

- 職員ID、日付
- 開始時刻、終了時刻
- シフト種別（早番、日勤、遅番、夜勤）

### Incident (事故・ヒヤリハット)

- タイトル、詳細説明
- 発生日時、重要度
- カテゴリ、報告者
- 対応状態

## プロジェクト構成

```
welfare-ops-dashboard-template/
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # ダッシュボードレイアウトグループ
│   │   ├── dashboard/      # ダッシュボードページ
│   │   ├── residents/      # 入所者管理ページ
│   │   ├── staff/          # 職員管理ページ
│   │   ├── shifts/         # シフト管理ページ
│   │   └── incidents/      # 事故管理ページ
│   ├── api/trpc/           # tRPC APIルート
│   ├── layout.tsx          # ルートレイアウト
│   └── globals.css         # グローバルスタイル
├── components/             # Reactコンポーネント
│   ├── ui/                 # shadcn/uiコンポーネント
│   └── sidebar.tsx         # サイドバーコンポーネント
├── lib/                    # ユーティリティライブラリ
│   ├── prisma.ts           # Prismaクライアント
│   └── trpc/               # tRPC設定
├── server/                 # バックエンドロジック
│   └── routers/            # tRPCルーター
│       ├── resident.ts
│       ├── staff.ts
│       ├── shift.ts
│       ├── incident.ts
│       └── _app.ts
└── prisma/                 # Prismaスキーマとマイグレーション
    └── schema.prisma
```

## 利用可能なスクリプト

```bash
npm run dev          # 開発サーバーを起動
npm run build        # プロダクションビルド
npm run start        # プロダクションサーバーを起動
npm run lint         # ESLintを実行
npm run test         # テストを実行（Vitest）
npm run test:ui      # テストUIを起動
npm run db:push      # Prismaスキーマをデータベースに反映
npm run db:seed      # シードデータを投入
npm run db:studio    # Prisma Studioを起動（データベースGUI）
```

## デモフロー: 入所者管理の完全なCRUD

このプロジェクトでは、**入所者（Resident）** の完全なCRUD操作が実装されており、エンドツーエンドで動作確認できます。

### 1. 一覧表示
`http://localhost:3000/residents` にアクセスすると、入所者の一覧が表示されます。

### 2. 新規登録
右上の「新規登録」ボタンをクリックし、以下の情報を入力：
- 氏名（例：山田 太郎）
- 年齢（例：75）
- 部屋番号（例：101）
- 介護度（1-5）
- 医療情報（任意）

「登録」ボタンをクリックすると、tRPC経由でデータがPostgreSQLに保存されます。

### 3. 詳細表示
一覧の任意の行をクリックすると、詳細モーダルが開きます。入所者の全情報が確認できます。

### 4. 編集
詳細モーダルの「編集」ボタンから、情報を更新できます。変更後「更新」をクリックすると、データベースに反映されます。

### 5. 削除
詳細モーダルの「削除」ボタンから、データを削除できます。確認ダイアログが表示されます。

**技術的な流れ:**
```
フロントエンド (React)
  → tRPC Client
  → Next.js API Route (/api/trpc)
  → tRPC Server Router (server/routers/resident.ts)
  → Prisma Client
  → PostgreSQL Database
```

全ての操作で型安全性が保証され、バリデーション（Zod）が自動的に行われます。

## テスト

プロジェクトにはVitestを使用したテスト環境が整っています。

```bash
# テストを実行
npm run test

# テストUIを起動（ブラウザで確認）
npm run test:ui
```

**実装済みのテスト:**
- ユーティリティ関数のテスト（`tests/utils.test.ts`）
- 入所者バリデーションのテスト（`tests/resident-validation.test.ts`）

## 今後の拡張案

このテンプレートは拡張可能に設計されています。以下のような追加機能を実装できます：

### 認証・セキュリティ
- [ ] NextAuth.js を使用した認証機能
- [ ] 役割ベースのアクセス制御（RBAC）
- [ ] APIレート制限

### データ管理
- [ ] 入所者と職員の関連付け（担当職員）
- [ ] シフトと入所者の関連付け（担当入所者）
- [ ] 事故報告と入所者の関連付け
- [ ] ファイルアップロード機能（写真、書類）
- [ ] データエクスポート機能（CSV、PDF）

### UI/UX改善
- [ ] リアルタイム通知（WebSocket）
- [ ] ダークモード対応
- [ ] モバイル最適化
- [ ] 多言語対応（i18n）

### レポート・分析
- [ ] 詳細な統計レポート
- [ ] グラフ・チャート表示（Chart.js、Recharts）
- [ ] 月次・年次レポート自動生成

### その他
- [ ] Staff、Shift、IncidentのCRUD操作実装
- [ ] 検索・フィルタリング機能
- [ ] ページネーション
- [ ] 監査ログ（操作履歴）

## 注意事項

- このテンプレートには**認証機能が含まれていません**。本番環境では必ず認証を実装してください。
- データベース接続情報などの機密情報は`.env`ファイルで管理し、**Gitにコミットしないでください**。
- 本番環境デプロイ前に、適切なエラーハンドリングとバリデーションを追加してください。
- PoCテンプレートとして提供されているため、セキュリティ要件を満たすための追加実装が必要です。

## ライセンス

MIT
