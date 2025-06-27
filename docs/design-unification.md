# デザイン統一計画書（拡張性・保守性重視）

---

## 1. カスタムdaisyUIテーマ設計

- **目的**: ブランド性・一貫性・将来の拡張性を両立
- **実施内容**:
  - `tailwind.config.js`でカラーパレット・フォント・角丸等を独自定義
  - daisyUIのカスタムテーマとして全体に適用
- **例**:
  - primary/secondary/accent/base/neutral/error/success/warning/info色
  - フォントファミリー・サイズ
  - 角丸（rounded）・シャドウ

---

## 2. 共通UIコンポーネント設計

- **目的**: UIパターンの統一と保守性向上
- **実施内容**:
  - `src/component/common/`配下に以下のラッパーを作成
    - `Button.tsx`（daisyUIのbtnをラップ）
    - `Input.tsx`（form-control/inputをラップ）
    - `Card.tsx`（cardをラップ）
    - `Dialog.tsx`（modal/dialogをラップ）
  - 既存画面は順次これらに置換

---

## 3. 運用・拡張ガイドライン

- **新規UIは必ず共通部品を利用**
- **カスタムテーマの変更はtailwind.config.jsのみで完結**
- **既存画面のリファクタは段階的に実施（優先度：主要画面→補助画面）**

---

## 4. 今後の流れ

1. `tailwind.config.js`でカスタムテーマ定義
2. `src/component/common/`に共通UIコンポーネント新設
3. 主要画面から順次リファクタ

---