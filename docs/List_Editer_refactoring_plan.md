# List.tsx・Editer.tsxリファクタリング詳細計画

## 目的
- 可読性・保守性向上
- 責務分離・再利用性向上
- 将来的な拡張・テスト容易性の確保

---

## 1. ファイル分割・構成案

```
src/
├─ component/
│  ├─ Editer/
│  │   ├─ Editer.tsx              # 親コンポーネント
│  │   ├─ TagEditor.tsx           # タグ編集UI
│  │   ├─ DeleteDialog.tsx        # 削除ダイアログ
│  │   ├─ ReplaceModePanel.tsx    # 置換モードUI
│  │   ├─ GlossaryEntries.tsx     # 関連用語集表示
│  │   └─ hooks/
│  │        ├─ useTagInput.ts     # タグ入力管理
│  │        └─ useGlossaryFilter.ts # Glossaryフィルタ
│  ├─ List/
│  │   ├─ List.tsx                # 親コンポーネント
│  │   ├─ Row.tsx                 # リスト行
│  │   ├─ FilterDropdown.tsx      # フィルタUI
│  │   ├─ TagAddModal.tsx         # タグ追加モーダル
│  │   └─ hooks/
│  │        └─ useFilteredItems.ts # フィルタロジック
├─ util/
│  ├─ highlightText.tsx           # テキストハイライト共通化
│  └─ truncateText.ts             # テキスト省略共通化
```

---

## 2. 各ファイルの責務

### Editer関連
- **Editer.tsx**  
  - 全体レイアウト・状態分配・サブ部品の統括
- **TagEditor.tsx**  
  - タグ編集UI・入力補助・候補表示
- **DeleteDialog.tsx**  
  - 削除確認ダイアログ
- **ReplaceModePanel.tsx**  
  - 置換モード時のUI・操作ボタン
- **GlossaryEntries.tsx**  
  - 関連用語集リスト表示
- **hooks/useTagInput.ts**  
  - タグ入力状態・補助ロジック
- **hooks/useGlossaryFilter.ts**  
  - Glossaryフィルタリングロジック

### List関連
- **List.tsx**  
  - 検索・フィルタ・リスト全体管理
- **Row.tsx**  
  - 1行分の表示・クリック処理
- **FilterDropdown.tsx**  
  - フィルタ選択UI
- **TagAddModal.tsx**  
  - タグ追加モーダル
- **hooks/useFilteredItems.ts**  
  - 検索・フィルタロジック

### util
- **highlightText.tsx**  
  - テキストハイライト共通関数
- **truncateText.ts**  
  - テキスト省略共通関数

---

## 3. props設計（例）

- Row.tsx  
  - props: item, isSelected, onClick
- TagEditor.tsx  
  - props: tags, allTags, onAddTag, onRemoveTag
- DeleteDialog.tsx  
  - props: open, onConfirm, onCancel

---

## 4. 実施手順（推奨）

1. 共通ユーティリティ関数の抽出・整理
2. サブコンポーネントの切り出し（UI部品単位）
3. hooks化（状態・副作用ロジックの共通化）
4. テスト・動作確認

---

## 5. 補足

- 既存の型定義・ストアは極力流用
- UI/UX・外部API仕様は現状維持
- 段階的にPRを分割しても良い

---

この設計方針でリファクタリングを進めます。ご確認ください。