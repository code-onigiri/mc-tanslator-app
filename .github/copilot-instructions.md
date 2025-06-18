# MC-Translator-App GitHub Copilot Instructions

## プロジェクト概要
MinecraftのリソースパックやMODの翻訳作業を効率化するWebアプリケーション

## 技術スタック
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: TailwindCSS 4.x + daisyUI
- **State Management**: Zustand
- **UI**: Framer Motion + React Hot Toast
- **Virtual Lists**: React Window + React Virtualized Auto Sizer
- **Translation API**: Google Translate API
- **Package Manager**: Bun
- **Linting**: ESLint + TypeScript ESLint

## アーキテクチャ
```
src/
├── component/          # UIコンポーネント
│   ├── stores/         # Zustand状態管理
│   ├── hooks/          # カスタムフック
│   ├── list/           # リスト関連コンポーネント
│   └── editor/         # エディター関連コンポーネント
├── page/               # ページコンポーネント
├── util/               # ユーティリティ関数
│   └── file/           # ファイル操作関連
└── main.tsx            # エントリーポイント
api/                    # 翻訳API
```

## 主要機能
- 翻訳データのリスト表示（仮想化対応）
- 検索・フィルタリング機能
- 置き換え機能（一括・確認）
- 用語集管理
- プロジェクトファイル保存・読み込み
- Google翻訳API連携
- ダークモード対応

## GitHub Copilot開発ガイド
- TypeScript strict mode 使用
- 関数コンポーネント + React Hooks パターン
- カスタムフックでロジック分離
- Zustandで状態管理（useStore pattern）
- TailwindCSS + daisyUI でスタイリング
- Framer Motionでアニメーション
- 仮想化リストで大量データ効率表示

## 状態管理
- `EditerStore`: エディター状態（選択中の翻訳項目、置き換えモード）
- `ListStore`: リストデータ、検索・フィルタ状態
- `GlossaryStore`: 用語集データ

## APIエンドポイント
- `POST /api/translate`: Google翻訳API経由でテキスト翻訳

## ファイル形式サポート
- `.json`: Minecraft言語ファイル
- `.lang`: 旧形式Minecraft言語ファイル
- `.mctp`: プロジェクトファイル（翻訳データ + 用語集）

## 開発コマンド
- `bun dev`: 開発サーバー起動
- `bun build`: プロダクションビルド
- `bun lint`: ESLintチェック

## 重要な設計パターン
- 仮想化リストで大量データを効率的に表示
- イベントバスで置き換え機能の状態管理
- カスタムフックでコンポーネント間のロジック共有
- Motion.divでスムーズなアニメーション
- TypeScript strictで型安全性確保

## GitHub Copilot向け補足
- コンポーネントは関数宣言（export default function）を使用
- 状態管理はZustandのcreate()パターン
- TailwindのclassNameは文字列結合ではなく条件分岐使用
- React Hooksの依存配列は適切に設定
- 型定義はinterfaceを使用してexportする
