# 一括AI翻訳機能 実装計画書

## 1. 背景と目的
大量の翻訳キーを効率的にAIで翻訳するため、「未翻訳のみ」または「全体」を選択して一括でAI翻訳できる機能を追加する。翻訳作業の効率化と品質向上を目的とする。

## 2. 変更スコープ（ファイル一覧）
- `src/component/Menu.tsx` … 編集メニュー新設・一括翻訳UI追加
- `src/component/Header.tsx` … メニュー呼び出し部の調整
- `src/component/stores/ListStore.ts` … 翻訳リスト型・ストア拡張
- `src/util/file/fileop.ts` … 翻訳データ型・ストア拡張
- `src/component/BulkAITranslate.tsx`（新規）… 一括AI翻訳ロジック・UI
- `src/util/ai/bulkTranslate.ts`（新規）… 並列AI翻訳ユーティリティ
- `src/types/bulkTranslate.ts`（新規）… 型定義

## 3. 詳細設計

### 3.1 型定義（`src/types/bulkTranslate.ts`）

```typescript
export type BulkTranslateMode = "all" | "untranslated";

export interface BulkTranslateRequest {
  keys: string[];
  source: Record<string, string>;
  target: Record<string, string>;
  mode: BulkTranslateMode;
  sourceLang: string;
  targetLang: string;
  prompt: string;
}

export interface BulkTranslateResult {
  key: string;
  translated: string;
  success: boolean;
  error?: string;
}

export interface BulkTranslateProgress {
  total: number;
  completed: number;
  failed: number;
  currentKey?: string;
}
```

### 3.2 UI設計（`BulkAITranslate.tsx`）

- 編集メニューに「一括AI翻訳」ボタン追加
- ダイアログで「未翻訳のみ」「全体」選択UI
- 実行時に進捗バー・キャンセルボタン・エラー表示
- 完了後は`translateTarget`を自動更新

### 3.3 ロジック設計

#### 3.3.1 対象キー抽出
- `mode === "all"`: `Object.keys(source)`
- `mode === "untranslated"`: `Object.keys(source).filter(key => !target[key] || target[key].trim() === "")`

#### 3.3.2 並列AI翻訳処理・レートリミット対応（`bulkTranslate.ts`）

- Promise.allSettledで同時リクエスト（同時数はMAX 5～10程度に制御）
- 1件ごとに`geminiClient.translate`を呼び出し
- 進捗コールバックでUIに反映
- エラー時は個別に記録し、部分成功も許容
- **Google Gemini APIのレートリミット(429)対策として、**
  - 429エラー時は指数バックオフでリトライ（例: 1, 2, 4, 8秒…最大5回）
  - 1分あたりの最大リクエスト数を超えないよう、リクエスト間にウェイトを挟む設計も検討
  - 進捗UIに「リトライ中」や「レート制限待機中」などの状態も表示

#### 3.3.3 状態管理
- 進捗・キャンセル状態はuseState/useRefで管理
- 結果は`BulkTranslateResult[]`として集約し、`translateTarget`を一括更新

#### 3.3.4 型安全性
- すべての関数・props・ストア拡張に型を厳密付与
- エラー型も明示

### 3.4 主要ロジック擬似コード

```typescript
async function bulkTranslate(req: BulkTranslateRequest, onProgress: (p: BulkTranslateProgress) => void): Promise<BulkTranslateResult[]> {
  const keys = req.mode === "all"
    ? req.keys
    : req.keys.filter(key => !req.target[key] || req.target[key].trim() === "");
  const results: BulkTranslateResult[] = [];
  let completed = 0, failed = 0;

  // 並列数制御
  const concurrency = 5;
  const queue = [...keys];
  const runNext = async (): Promise<void> => {
    const key = queue.shift();
    if (!key) return;
    try {
      const res = await geminiClient.translate({ text: req.source[key], ... });
      results.push({ key, translated: res.translatedText, success: true });
    } catch (e) {
      results.push({ key, translated: "", success: false, error: String(e) });
      failed++;
    }
    completed++;
    onProgress({ total: keys.length, completed, failed, currentKey: key });
    await runNext();
  };
  await Promise.all(Array(concurrency).fill(0).map(runNext));
  return results;
}
```

## 4. テスト方針
- ユニットテスト：  
  - 型安全性（型エラーが出ないこと）
  - 並列翻訳処理の正常系・異常系
  - 進捗・キャンセル・エラー通知の動作
- 結合テスト：  
  - UIから一括翻訳実行→`translateTarget`が正しく更新される
  - 未翻訳/全体切替の動作
  - APIレート制限・エラー時の部分復旧

## 5. 作業手順
1. 型定義ファイル`src/types/bulkTranslate.ts`作成
2. 並列翻訳ユーティリティ`src/util/ai/bulkTranslate.ts`実装
3. UIコンポーネント`src/component/BulkAITranslate.tsx`新規作成
4. `Menu.tsx`に編集カテゴリ新設＋一括翻訳UI組み込み
5. ストア型拡張（ListStore, fileop等）
6. テストコード追加
7. 動作確認・UX調整
8. ドキュメント更新

---
この計画で進めます。