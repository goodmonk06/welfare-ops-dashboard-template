# 福祉事業所向け業務ダッシュボード テンプレート

入所者情報・職員シフト・事故報告などをまとめて管理する福祉事業所向けダッシュボードのNext.jsテンプレートです。

> **⚠️ 重要**: このプロジェクトはプロダクション用ではなく、**PoCテンプレート**として提供されています。実際の運用環境で使用する前に、セキュリティ、認証、データ検証などを適切に実装してください。

## 技術スタック

- **フロントエンド**: Next.js 15 (App Router) + TypeScript
- **バックエンド**: tRPC + Next.js API Routes
- **データベース**: PostgreSQL + Prisma ORM
- **UI**: Tailwind CSS + shadcn/ui
- **状態管理**: TanStack Query (React Query)

## 機能

- 📊 **ダッシュボード**: 入所者数、職員数、シフト状況、事故報告数の概要表示
- 👥 **入所者管理**: 入所者の一覧表示と基本情報管理
- 👔 **職員管理**: 職員の一覧表示と基本情報管理
- 📅 **シフト管理**: 月次カレンダーによるシフト表示
- ⚠️ **事故・ヒヤリハット管理**: 事故報告とヒヤリハットの記録管理

## セットアップ手順

### 1. 前提条件

- Node.js 18以上
- PostgreSQL 14以上
- npm または yarn

### 2. リポジトリのクローン

```bash
git clone <repository-url>
cd welfare-ops-dashboard-template
```

### 3. 依存関係のインストール

```bash
npm install
```

### 4. データベースのセットアップ

PostgreSQLデータベースを作成します。

```bash
# PostgreSQLにログイン
psql -U postgres

# データベースを作成
CREATE DATABASE welfare_ops;
```

### 5. 環境変数の設定

`.env`ファイルを作成し、データベース接続情報を設定します。

```env
DATABASE_URL="postgresql://ユーザー名:パスワード@localhost:5432/welfare_ops?schema=public"
```

### 6. データベースマイグレーション

Prismaを使用してデータベーススキーマを作成します。

```bash
npm run db:push
```

### 7. 開発サーバーの起動

```bash
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
npm run db:push      # Prismaスキーマをデータベースに反映
npm run db:studio    # Prisma Studioを起動（データベースGUI）
```

## カスタマイズ

このテンプレートは拡張可能に設計されています。以下のような追加機能を実装できます：

- 認証・認可機能（NextAuth.js等）
- ファイルアップロード機能
- リアルタイム通知
- 詳細なレポート機能
- データエクスポート機能
- 多言語対応

## 注意事項

- このテンプレートには**認証機能が含まれていません**。本番環境では必ず認証を実装してください。
- データベース接続情報などの機密情報は`.env`ファイルで管理し、**Gitにコミットしないでください**。
- 本番環境デプロイ前に、適切なエラーハンドリングとバリデーションを追加してください。
- PoCテンプレートとして提供されているため、セキュリティ要件を満たすための追加実装が必要です。

## ライセンス

MIT
