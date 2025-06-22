# 設定機能の拡張計画

## 概要
設定画面により多くの機能を追加し、ユーザビリティを向上させます。

## 実装する機能

### 1. リストの左右切り替え機能
**目的**: UIレイアウトの柔軟性を提供し、ユーザーの好みに合わせてリストとエディターの配置を変更できるようにする。

**機能詳細**:
- デフォルト: リスト（左）｜エディター（右）
- 切り替え後: エディター（左）｜リスト（右）
- 設定値をlocalStorageに保存し、アプリ再起動時も維持

**必要な変更ファイル**:
- `src/component/Setting.tsx` - UI設定項目の追加
- `src/page/edit.tsx` - レイアウトの切り替えロジック
- `src/component/stores/SettingsStore.ts` - 新規作成（設定用のZustandストア）

### 2. daisyUIテーマ変更機能
**目的**: 現在のlight/darkテーマ以外にも、daisyUIの豊富なテーマから選択できるようにする。

**機能詳細**:
- 利用可能テーマ: light, dark, cupcake, cyberpunk, valentine, halloween, garden, forest, aqua, lofi, pastel, fantasy, wireframe, black, luxury, dracula, cmyk, autumn, business, acid, lemonade, night, coffee, winter, dim, nord, sunset
- テーマプレビュー機能
- 設定値をlocalStorageに保存

**必要な変更ファイル**:
- `src/component/Setting.tsx` - テーマ選択UIの拡張
- `tailwind.config.js` - 追加テーマの設定
- `src/component/stores/SettingsStore.ts` - テーマ状態の管理

### 3. 装飾文字（カラーコード）の表示非表示機能
**目的**: Minecraftのカラーコード表示を切り替えて、視認性を向上させる。

**機能詳細**:
- カラーコード表示モード: 
  - 表示（現在の状態）: `§c赤色テキスト` → カラーコード表示 + 色適用
  - 非表示: `§c赤色テキスト` → 色のみ適用、カラーコード文字列は非表示
  - プレーンテキスト: `§c赤色テキスト` → カラーコード含めてプレーンテキスト表示
- 設定値をlocalStorageに保存

**必要な変更ファイル**:
- `src/component/Setting.tsx` - カラーコード表示設定の追加
- `src/component/ColorCodeText.tsx` - 表示モードに応じた描画変更
- `src/util/colorCode.tsx` - 新しい描画モード関数の追加
- `src/component/stores/SettingsStore.ts` - カラーコード表示状態の管理
- `src/component/List.tsx` - 設定に応じたカラーコード表示の切り替え
- `src/component/Editer.tsx` - エディターでのカラーコード表示切り替え

## 実装セクション

### セクション1: 設定用Zustandストアの作成
**ファイル**: `src/component/stores/SettingsStore.ts`
**内容**: 各種設定値の管理

### セクション2: Setting.tsxの機能拡張
**ファイル**: `src/component/Setting.tsx`
**内容**: 新しい設定項目のUI追加

### セクション3: レイアウト切り替えの実装
**ファイル**: `src/page/edit.tsx`
**内容**: リスト位置の切り替えロジック

### セクション4: テーマ機能の拡張
**ファイル**: `tailwind.config.js`, `src/component/Setting.tsx`
**内容**: 複数テーマ対応

### セクション5: カラーコード表示機能の拡張
**ファイル**: `src/util/colorCode.tsx`, `src/component/ColorCodeText.tsx`
**内容**: 表示モード対応

### セクション6: 各コンポーネントでの設定適用
**ファイル**: `src/component/List.tsx`, `src/component/Editer.tsx` など
**内容**: 設定値に応じた動作変更

## 注意点
- 既存機能への影響を最小限に抑える
- 後方互換性を維持
- パフォーマンスに影響しないよう設計
- 全体のテーマ適用が確実に動作するよう実装