import { JsonData } from "./fileop";

// 差分検出結果の型定義
export interface UpdateDiff {
  added: string[];      // 新規追加キー
  deleted: string[];    // 削除されたキー  
  modified: {           // 変更されたキー
    key: string;
    oldValue: string;
    newValue: string;
  }[];
  unchanged: string[];  // 変更なしキー
}

// 統計情報の型定義
export interface UpdateStats {
  totalAdded: number;
  totalDeleted: number;
  totalModified: number;
  totalUnchanged: number;
}

/**
 * 新旧の翻訳データを比較して差分を検出する
 * @param oldData 既存の翻訳データ
 * @param newData 新しい翻訳データ
 * @returns 差分検出結果
 */
export function detectUpdateDiff(
  oldData: JsonData | null,
  newData: JsonData | null
): UpdateDiff {
  const result: UpdateDiff = {
    added: [],
    deleted: [],
    modified: [],
    unchanged: []
  };

  // データが存在しない場合の処理
  if (!oldData && !newData) {
    return result;
  }

  if (!oldData && newData) {
    // 既存データがない場合、すべて新規追加
    result.added = Object.keys(newData);
    return result;
  }

  if (oldData && !newData) {
    // 新データがない場合、すべて削除
    result.deleted = Object.keys(oldData);
    return result;
  }

  if (!oldData || !newData) {
    return result;
  }

  const oldKeys = new Set(Object.keys(oldData));
  const newKeys = new Set(Object.keys(newData));

  // 新規追加されたキーを検出
  for (const key of newKeys) {
    if (!oldKeys.has(key)) {
      result.added.push(key);
    }
  }

  // 削除されたキーを検出
  for (const key of oldKeys) {
    if (!newKeys.has(key)) {
      result.deleted.push(key);
    }
  }

  // 既存キーの変更を検出
  for (const key of oldKeys) {
    if (newKeys.has(key)) {
      const oldValue = oldData[key];
      const newValue = newData[key];
      
      if (oldValue !== newValue) {
        result.modified.push({
          key,
          oldValue,
          newValue
        });
      } else {
        result.unchanged.push(key);
      }
    }
  }

  // 結果をソート（一貫性のため）
  result.added.sort();
  result.deleted.sort();
  result.modified.sort((a, b) => a.key.localeCompare(b.key));
  result.unchanged.sort();

  return result;
}

/**
 * 差分結果から統計情報を生成する
 * @param diff 差分検出結果
 * @returns 統計情報
 */
export function getUpdateStats(diff: UpdateDiff): UpdateStats {
  return {
    totalAdded: diff.added.length,
    totalDeleted: diff.deleted.length,
    totalModified: diff.modified.length,
    totalUnchanged: diff.unchanged.length
  };
}

/**
 * 差分結果に基づいて自動タグを生成する
 * @param diff 差分検出結果
 * @param existingTags 既存のタグ情報
 * @returns 更新されたタグ情報
 */
export function generateAutoTags(
  diff: UpdateDiff,
  existingTags: { [key: string]: string[] } = {}
): { [key: string]: string[] } {
  const newTags = { ...existingTags };

  // 新規追加キーに 'new' タグを追加
  diff.added.forEach(key => {
    const currentTags = newTags[key] || [];
    if (!currentTags.includes('new')) {
      newTags[key] = [...currentTags, 'new'];
    }
  });

  // 削除されたキーに 'deleted' タグを追加
  diff.deleted.forEach(key => {
    const currentTags = newTags[key] || [];
    if (!currentTags.includes('deleted')) {
      newTags[key] = [...currentTags, 'deleted'];
    }
  });

  // 変更されたキーに 'updated' タグを追加
  diff.modified.forEach(({ key }) => {
    const currentTags = newTags[key] || [];
    if (!currentTags.includes('updated')) {
      newTags[key] = [...currentTags, 'updated'];
    }
  });

  return newTags;
}

/**
 * 差分結果が空かどうかをチェックする
 * @param diff 差分検出結果
 * @returns 差分がない場合はtrue
 */
export function isEmptyDiff(diff: UpdateDiff): boolean {
  return diff.added.length === 0 &&
         diff.deleted.length === 0 &&
         diff.modified.length === 0;
}

/**
 * 差分結果を人間が読める文字列に変換する
 * @param diff 差分検出結果
 * @returns 差分の説明文
 */
export function formatDiffSummary(diff: UpdateDiff): string {
  const stats = getUpdateStats(diff);
  const parts: string[] = [];

  if (stats.totalAdded > 0) {
    parts.push(`新規追加: ${stats.totalAdded}件`);
  }
  
  if (stats.totalModified > 0) {
    parts.push(`変更: ${stats.totalModified}件`);
  }
  
  if (stats.totalDeleted > 0) {
    parts.push(`削除: ${stats.totalDeleted}件`);
  }

  if (parts.length === 0) {
    return "変更はありません";
  }

  return parts.join(", ");
}