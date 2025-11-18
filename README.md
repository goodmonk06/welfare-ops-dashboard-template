# 福祉事業所向け業務ダッシュボード テンプレート

入所者情報・職員シフト・事故報告などをまとめて管理する福祉事業所向けダッシュボードのNext.jsテンプレートです。

> **⚠️ 重要**: このプロジェクトはプロダクション用ではなく、**PoCテンプレート**として提供されています。実際の運用環境で使用する前に、セキュリティ、認証、データ検証などを適切に実装してください。

## 概要

このプロジェクトは、福祉事業所（介護施設、デイサービスなど）の日常業務を効率化するためのダッシュボードテンプレートです。入所者管理、職員シフト、事故報告などの基本機能を備え、すぐに使い始められる状態で提供されています。

**主な特徴:**
- 🚀 フルスタックTypeScriptで型安全
- 🎨 モダンなUIデザイン（shadcn/ui）
- 🔄 リアルタイムデータ更新（TanStack Query）
- 🧪 包括的テスト環境（Vitest）- **78テスト実装済み**
- 🐳 Dockerで簡単デプロイ
- 📊 ロギング・メトリクス収集
- 🔌 拡張性の高いアダプター設計
- 🎯 ドメインイベント駆動アーキテクチャ
- 📚 完全なAPI・アーキテクチャドキュメント

## 技術スタック

- **フロントエンド**: Next.js 15 (App Router) + TypeScript
- **バックエンド**: tRPC + Next.js API Routes
- **データベース**: PostgreSQL + Prisma ORM
- **UI**: Tailwind CSS + shadcn/ui
- **状態管理**: TanStack Query (React Query)
- **テスト**: Vitest + Testing Library
- **コンテナ**: Docker + Docker Compose

## ドメインモデル

このアプリケーションは **10個のエンティティ** で構成されています：

### 主要エンティティ

#### Resident (入所者)
入所者の基本情報と医療情報を管理。介護度（1-5）、入所/退所日、緊急連絡先、担当介護職員を追跡。
- **Phase 3拡張**: タグ、メタデータ、担当職員との関連付け、ソフトデリート対応

#### Staff (職員)
職員の情報と役割を管理。部署、資格、連絡先を含む。
- **Phase 3拡張**: 部署管理、資格一覧、タグ、採用/退職日、メタデータ

#### Shift (シフト)
職員の勤務スケジュールを管理。早番、日勤、遅番、夜勤などの区分。
- **Phase 3拡張**: ステータス管理、備考、タグ

#### Incident (事故・ヒヤリハット)
事故報告とヒヤリハットを記録。重要度、対応状況、目撃者、再発防止策を管理。
- **Phase 3拡張**: 報告者・入所者との関連付け、目撃者リスト、実施措置、再発防止策、ドキュメント添付

### サポートエンティティ（Phase 3新規追加）

#### ActivityLog (活動ログ)
全エンティティの変更履歴を記録する監査証跡。

#### Document (ドキュメント)
ファイルのメタデータと保存先参照を管理。

#### Task (タスク)
スケジュールされたタスクとリマインダーを管理。優先度、期日、完了状態を追跡。

#### Note (メモ)
日報、申し送り、重要事項などのメモを管理。

#### CareAssessment (ケア評価)
定期的な入所者評価とケアプラン。ADL、認知機能、次回評価日を記録。

#### Medication (服薬)
服薬スケジュールと管理。用量、頻度、開始/終了日を追跡。

**エンティティ間の関係:**
- Staff → Shift (1対多)
- Staff → Incident (報告者, 1対多)
- Staff → Resident (担当職員, 1対多)
- Resident → Incident (関連入所者, 1対多)
- Resident → Note, CareAssessment, Medication (各1対多)
- Incident → Document (1対多)

**共通フィールド:**
全エンティティに以下を実装：
- `tags: String[]` - 柔軟なカテゴリ分け
- `metadata: Json?` - 拡張可能なカスタムデータ
- `archivedAt: DateTime?` - ソフトデリート対応
- `createdAt/updatedAt` - タイムスタンプ

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

## Phase 3 拡張機能

Phase 3では、プロダクションレディなアーキテクチャとインフラストラクチャを実装しました：

### 🏗️ インフラストラクチャ

#### ロギング (`lib/core/logger.ts`)
構造化JSONロギングで運用性を向上：
```typescript
logger.info("User action", { userId: "123", action: "login" });
logger.logAudit("create", "Resident", residentId, metadata);
logger.logRequest("GET", "/api/residents", { statusCode: 200, duration: 45 });
```

#### メトリクス (`lib/core/metrics.ts`)
ビジネス・パフォーマンスメトリクス収集：
```typescript
metrics.recordCounter("api.requests", 1);
metrics.trackBusinessMetric("residents.total", 25);
await measureTime("database.query", async () => { ... });
```

#### ドメインイベント (`lib/events/domain-events.ts`)
イベント駆動アーキテクチャでモジュール間連携：
```typescript
// イベント発行
await emitEvent({
  type: "incident.created",
  data: { incidentId, severity: "high" }
});

// イベント購読
eventBus.on("incident.created", async (event) => {
  // 重要なインシデントを通知
});
```

### 🔌 拡張性機構

#### 通知アダプター (`lib/adapters/notification.adapter.ts`)
- Console, Email, SMS実装
- 環境変数で切り替え可能
- 本番環境でSendGrid/Twilioと統合可能

#### ストレージアダプター (`lib/adapters/storage.adapter.ts`)
- Local, S3実装
- ファイルアップロード対応
- 環境に応じて保存先を選択

### 📊 強化されたAPI

#### Staff Router
- 部署・役割・ステータスでフィルタリング
- 資格・タグ管理
- 完全なCRUD + 監査ログ

#### Incident Router
- 重要度・ステータス・入所者でフィルタリング
- 報告者・入所者との関連付け
- ドメインイベント発行（作成・解決時）
- 目撃者・実施措置・再発防止策の記録

## テスト

プロジェクトには**78個の包括的なテスト**が実装されています。

```bash
# テストを実行
npm run test

# テストUIを起動（ブラウザで確認）
npm run test:ui
```

**実装済みのテスト:**
- ✅ **Staff Router** (7テスト) - フィルタリング、CRUD、バリデーション
- ✅ **Incident Router** (7テスト) - フィルタリング、CRUD、イベント発行
- ✅ **イベントバス** (8テスト) - イベント登録・発行・エラーハンドリング
- ✅ **アダプター** (19テスト) - 通知・ストレージアダプター
- ✅ **インフラストラクチャ** (28テスト) - ロガー・メトリクス
- ✅ **バリデーション** (9テスト) - 入所者・ユーティリティ

**テストカバレッジ:** 主要なビジネスロジックとインフラストラクチャをカバー

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

## ドキュメント

### 📚 詳細ドキュメント

- **[アーキテクチャガイド](docs/ARCHITECTURE.md)**
  - システム設計とパターン
  - 技術スタック詳細
  - デザインパターン（リポジトリ、アダプター、イベント駆動）
  - セキュリティ考慮事項
  - パフォーマンス最適化
  - 拡張ポイント

- **[API リファレンス](docs/API_REFERENCE.md)**
  - 全tRPCエンドポイント仕様
  - リクエスト・レスポンス型定義
  - ドメインイベント一覧
  - エラーハンドリング
  - ベストプラクティス

- **[Phase 3 概要](docs/PHASE3_OVERVIEW.md)**
  - Phase 3実装計画
  - 新機能・エンティティ
  - 実装の目的と成果基準

### 🗂️ プロジェクト構成

```
welfare-ops-dashboard-template/
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # ダッシュボードレイアウトグループ
│   └── api/trpc/           # tRPC APIルート
├── components/             # Reactコンポーネント
│   └── ui/                 # shadcn/uiコンポーネント
├── lib/                    # ライブラリとユーティリティ
│   ├── core/               # コアインフラ（logger, metrics）
│   ├── adapters/           # アダプター（notification, storage）
│   ├── events/             # ドメインイベント
│   ├── prisma.ts           # Prismaクライアント
│   └── trpc/               # tRPC設定
├── server/                 # バックエンドロジック
│   └── routers/            # tRPCルーター
├── prisma/                 # Prismaスキーマとseed
│   ├── schema.prisma       # データベーススキーマ
│   └── seed.ts             # シードデータ
├── tests/                  # テストファイル
│   ├── staff-router.test.ts
│   ├── incident-router.test.ts
│   ├── event-bus.test.ts
│   ├── adapters.test.ts
│   └── infrastructure.test.ts
└── docs/                   # ドキュメント
    ├── ARCHITECTURE.md
    ├── API_REFERENCE.md
    └── PHASE3_OVERVIEW.md
```

## 注意事項

- このテンプレートには**認証機能が含まれていません**。本番環境では必ず認証を実装してください。
- データベース接続情報などの機密情報は`.env`ファイルで管理し、**Gitにコミットしないでください**。
- 本番環境デプロイ前に、適切なエラーハンドリングとバリデーションを追加してください。
- PoCテンプレートとして提供されているため、セキュリティ要件を満たすための追加実装が必要です。

## ライセンス

MIT
