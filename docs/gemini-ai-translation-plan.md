# Gemini AI翻訳機能実装計画

## 現在の状況分析

### 既存実装
- `src/component/AITranslator.tsx`: モック実装のAI翻訳コンポーネント（GPT-3.5/GPT-4選択可能）
- `src/component/Translator.tsx`: Google Translate API使用の通常翻訳
- `src/component/Setting.tsx`: テーマ設定のみの基本設定画面
- `api/translate.mjs`: Google Translate API処理

### 要件整理
- **+D**: APIとプロンプトを設定できる設定画面 (&C 拡張性)
- **+A**: Gemini API処理 (&D サーバー側で処理しない、&T テスト)
- **+D**: AI翻訳画面の使用
- **!**: エラー処理をちゃんとする

## 実装計画

### セクション1: Gemini API設定とクライアント実装
**ファイル編集数: 3ファイル**

#### 1.1 Gemini API設定ストア作成
- `src/component/stores/GeminiStore.ts` (新規作成)
  - API キー管理
  - プロンプト設定管理
  - 翻訳設定 (温度、最大トークン数等)

#### 1.2 Gemini APIクライアント実装
- `src/util/gemini/geminiClient.ts` (新規作成)
  - Gemini API呼び出し処理
  - エラーハンドリング
  - レート制限対応

#### 1.3 型定義
- `src/types/gemini.ts` (新規作成)
  - Gemini API関連の型定義
  - 翻訳リクエスト/レスポンス型

### セクション2: 設定画面の拡張
**ファイル編集数: 2ファイル**

#### 2.1 Gemini設定コンポーネント
- `src/component/GeminiSettings.tsx` (新規作成)
  - API キー設定
  - プロンプトテンプレート設定
  - 翻訳パラメータ設定

#### 2.2 設定画面の拡張
- `src/component/Setting.tsx` (修正)
  - Gemini設定へのナビゲーション追加
  - 設定タブ機能追加

### セクション3: AI翻訳機能の実装
**ファイル編集数: 2ファイル**

#### 3.1 AITranslatorコンポーネントの更新
- `src/component/AITranslator.tsx` (修正)
  - Geminiストアとの連携
  - 実際のGemini API呼び出し
  - エラーハンドリング強化

#### 3.2 カスタムプロンプト機能
- `src/util/gemini/promptTemplates.ts` (新規作成)
  - 翻訳用プロンプトテンプレート
  - 専門用語対応プロンプト

### セクション4: テストとエラー処理
**ファイル編集数: 3ファイル**

#### 4.1 テストファイル作成
- `src/__tests__/gemini.test.ts` (新規作成)
  - Gemini API呼び出しテスト
  - エラーケーステスト

#### 4.2 エラーハンドリング強化
- `src/util/errorHandler.ts` (新規作成)
  - 統一されたエラーハンドリング
  - ユーザー向けエラーメッセージ

#### 4.3 ローディング・フィードバック改善
- `src/component/LoadingIndicator.tsx` (新規作成)
  - 翻訳進行状況表示
  - キャンセル機能

## 技術仕様

### Gemini API仕様
- モデル: `gemini-1.5-flash`, `gemini-1.5-pro`選択可能
- クライアントサイド実装（&D要件: サーバー側処理しない）
- 環境変数での API キー管理

### 拡張性考慮 (&C要件)
- プラグイン型プロンプト管理
- 複数AI プロバイダー対応準備
- 設定のインポート/エクスポート機能

### エラー処理仕様 (!要件)
- APIキー無効時の適切なエラー表示
- ネットワークエラー対応
- レート制限エラー対応
- フォールバック翻訳 (Google Translate)

## 実装順序
1. セクション1: 基盤となるストアとAPIクライアント
2. セクション2: ユーザーが設定できる画面
3. セクション3: 実際の翻訳機能
4. セクション4: 品質保証とエラー処理

各セクションは段階的に実装し、動作確認を行いながら進める。