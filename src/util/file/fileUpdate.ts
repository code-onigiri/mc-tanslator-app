import { JsonData, FileComments, translateData } from "./fileop";
import {
  detectUpdateDiff,
  generateAutoTags,
  UpdateDiff,
  formatDiffSummary,
  isEmptyDiff
} from "./updateDiff";

// 更新オプションの型定義
export interface UpdateOptions {
  preserveDeletedKeys: boolean;  // 削除されたキーを保持するか
  autoApplyTags: boolean;        // 自動タグを適用するか
  preserveUserTags: boolean;     // ユーザーが手動で付けたタグを保持するか
}

// 更新結果の型定義
export interface UpdateResult {
  success: boolean;
  diff: UpdateDiff;
  summary: string;
  error?: string;
}

// デフォルトの更新オプション
export const DEFAULT_UPDATE_OPTIONS: UpdateOptions = {
  preserveDeletedKeys: true,
  autoApplyTags: true,
  preserveUserTags: true
};

/**
 * 翻訳元データを更新し、差分に基づいてタグを自動付与する
 * @param newSourceData 新しい翻訳元データ
 * @param newSourceComments 新しい翻訳元コメント
 * @param options 更新オプション
 * @returns 更新結果
 */
export function updateSourceData(
  newSourceData: JsonData,
  newSourceComments: FileComments | null = null,
  options: UpdateOptions = DEFAULT_UPDATE_OPTIONS
): UpdateResult {
  try {
    const currentState = translateData.getState();
    const oldSourceData = currentState.translateSource;
    const oldTargetData = currentState.translateTarget;
    const oldItemTags = currentState.itemTags || {};

    // 差分を検出
    const diff = detectUpdateDiff(oldSourceData, newSourceData);
    
    // 差分がない場合は早期リターン
    if (isEmptyDiff(diff)) {
      return {
        success: true,
        diff,
        summary: "変更はありません"
      };
    }

    // 新しいターゲットデータを構築
    const updatedTargetData: JsonData = { ...oldTargetData };

    // 新しい翻訳元データをベースにする
    const updatedSourceData: JsonData = { ...newSourceData };

    // 削除されたキーの処理
    if (options.preserveDeletedKeys) {
      // 削除されたキーを新しいデータに追加し、値は旧データのまま残す
      diff.deleted.forEach(key => {
        if (oldSourceData && oldSourceData[key] !== undefined) {
          updatedSourceData[key] = oldSourceData[key];
        }
      });
    } else {
      diff.deleted.forEach(key => {
        delete updatedTargetData[key];
      });
    }

    // 新規追加キーの処理（空の翻訳文で初期化）
    diff.added.forEach(key => {
      if (!updatedTargetData[key]) {
        updatedTargetData[key] = "";
      }
    });

    // 自動タグの生成と適用
    let updatedTags = { ...oldItemTags };
    if (options.autoApplyTags) {
      updatedTags = generateAutoTags(diff, oldItemTags);
      
      // ユーザータグの保護処理
      if (options.preserveUserTags) {
        updatedTags = preserveUserTags(updatedTags, oldItemTags);
      }
    }

    // ストアを更新
    currentState.settranslateSource(updatedSourceData);
    currentState.settranslateTarget(updatedTargetData);
    currentState.setItemTags(updatedTags);
    
    if (newSourceComments) {
      currentState.setSourceComments(newSourceComments);
    }

    // リストストアの同期は useSyncTranslateData で自動実行される

    const summary = formatDiffSummary(diff);
    
    return {
      success: true,
      diff,
      summary
    };

  } catch (error) {
    console.error("更新処理中にエラーが発生しました:", error);
    return {
      success: false,
      diff: { added: [], deleted: [], modified: [], unchanged: [] },
      summary: "",
      error: error instanceof Error ? error.message : "不明なエラー"
    };
  }
}

/**
 * ユーザーが手動で付けたタグを保護する
 * システムタグ（new, deleted, updated）以外のタグを保持
 * @param newTags 新しいタグ情報
 * @param oldTags 既存のタグ情報
 * @returns ユーザータグが保護されたタグ情報
 */
function preserveUserTags(
  newTags: { [key: string]: string[] },
  oldTags: { [key: string]: string[] }
): { [key: string]: string[] } {
  const systemTags = new Set(['new', 'deleted', 'updated']);
  const preservedTags = { ...newTags };

  Object.keys(oldTags).forEach(key => {
    const oldUserTags = oldTags[key].filter(tag => !systemTags.has(tag));
    const newSystemTags = (newTags[key] || []).filter(tag => systemTags.has(tag));
    
    if (oldUserTags.length > 0) {
      preservedTags[key] = [...newSystemTags, ...oldUserTags];
    }
  });

  return preservedTags;
}

/**
 * 更新前の差分をプレビュー表示用に取得する
 * @param newSourceData 新しい翻訳元データ
 * @returns 差分情報
 */
export function previewUpdate(newSourceData: JsonData): UpdateDiff {
  const currentState = translateData.getState();
  const oldSourceData = currentState.translateSource;
  
  return detectUpdateDiff(oldSourceData, newSourceData);
}

/**
 * 削除されたキーを完全に除去する
 * @param keysToRemove 削除するキーの配列
 */
export function removeDeletedKeys(keysToRemove: string[]): void {
  const currentState = translateData.getState();
  const targetData = { ...currentState.translateTarget };
  const itemTags = { ...currentState.itemTags || {} };

  keysToRemove.forEach(key => {
    delete targetData[key];
    delete itemTags[key];
  });

  currentState.settranslateTarget(targetData);
  currentState.setItemTags(itemTags);
}

/**
 * 特定のキーのタグを更新する
 * @param key 対象のキー
 * @param tags 新しいタグ配列
 */
export function updateKeyTags(key: string, tags: string[]): void {
  const currentState = translateData.getState();
  const itemTags = { ...currentState.itemTags || {} };
  
  if (tags.length > 0) {
    itemTags[key] = tags;
  } else {
    delete itemTags[key];
  }
  
  currentState.setItemTags(itemTags);
}

/**
 * システムタグ（new, deleted, updated）をクリアする
 * @param keys 対象のキー配列（省略時は全キー）
 */
export function clearSystemTags(keys?: string[]): void {
  const currentState = translateData.getState();
  const itemTags = { ...currentState.itemTags || {} };
  const systemTags = new Set(['new', 'deleted', 'updated']);
  
  const targetKeys = keys || Object.keys(itemTags);
  
  targetKeys.forEach(key => {
    if (itemTags[key]) {
      const userTags = itemTags[key].filter(tag => !systemTags.has(tag));
      if (userTags.length > 0) {
        itemTags[key] = userTags;
      } else {
        delete itemTags[key];
      }
    }
  });
  
  currentState.setItemTags(itemTags);
}

/**
 * 更新統計情報を取得する
 * @returns 現在のデータの統計情報
 */
export function getUpdateStatistics() {
  const currentState = translateData.getState();
  const itemTags = currentState.itemTags || {};
  
  let newCount = 0;
  let deletedCount = 0;
  let updatedCount = 0;
  
  Object.values(itemTags).forEach(tags => {
    if (tags.includes('new')) newCount++;
    if (tags.includes('deleted')) deletedCount++;
    if (tags.includes('updated')) updatedCount++;
  });
  
  return {
    newCount,
    deletedCount,
    updatedCount,
    totalTaggedItems: Object.keys(itemTags).length
  };
}

/**
 * 特定のキーを削除済みとしてマークする（論理削除）
 * @param key 削除するキー
 */
export function markKeyAsDeleted(key: string): void {
  const currentState = translateData.getState();
  const itemTags = { ...currentState.itemTags || {} };
  const currentTags = itemTags[key] || [];
  
  // 既にdeletedタグがある場合は何もしない
  if (currentTags.includes('deleted')) {
    return;
  }
  
  // deletedタグを追加
  itemTags[key] = [...currentTags, 'deleted'];
  currentState.setItemTags(itemTags);
}

/**
 * 削除済みマークを解除する
 * @param key 復元するキー
 */
export function unmarkKeyAsDeleted(key: string): void {
  const currentState = translateData.getState();
  const itemTags = { ...currentState.itemTags || {} };
  const currentTags = itemTags[key] || [];
  
  // deletedタグを削除
  const newTags = currentTags.filter(tag => tag !== 'deleted');
  
  if (newTags.length > 0) {
    itemTags[key] = newTags;
  } else {
    delete itemTags[key];
  }
  
  currentState.setItemTags(itemTags);
}

/**
 * 削除済み項目を完全に削除する
 * @param key 完全削除するキー
 */
export function permanentlyDeleteKey(key: string): void {
  const currentState = translateData.getState();
  const sourceData = { ...currentState.translateSource };
  const targetData = { ...currentState.translateTarget };
  const itemTags = { ...currentState.itemTags || {} };
  
  // 全てのストアからキーを削除
  delete sourceData[key];
  delete targetData[key];
  delete itemTags[key];
  
  currentState.settranslateSource(sourceData);
  currentState.settranslateTarget(targetData);
  currentState.setItemTags(itemTags);
}