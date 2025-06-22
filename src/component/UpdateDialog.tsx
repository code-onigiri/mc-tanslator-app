import React, { useState, useEffect } from "react";
import { UpdateDiff, getUpdateStats, formatDiffSummary } from "../util/file/updateDiff";
import { UpdateOptions, DEFAULT_UPDATE_OPTIONS } from "../util/file/fileUpdate";

interface UpdateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options: UpdateOptions) => void;
  diff: UpdateDiff;
  isLoading?: boolean;
}

export default function UpdateDialog({
  isOpen,
  onClose,
  onConfirm,
  diff,
  isLoading = false
}: UpdateDialogProps) {
  const [options, setOptions] = useState<UpdateOptions>(DEFAULT_UPDATE_OPTIONS);
  const [showDetails, setShowDetails] = useState(false);

  // ダイアログが開かれた時にオプションをリセット
  useEffect(() => {
    if (isOpen) {
      setOptions(DEFAULT_UPDATE_OPTIONS);
      setShowDetails(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const stats = getUpdateStats(diff);
  const summary = formatDiffSummary(diff);
  const hasChanges = stats.totalAdded > 0 || stats.totalDeleted > 0 || stats.totalModified > 0;

  const handleConfirm = () => {
    onConfirm(options);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* ヘッダー */}
        <div className="p-6 border-b border-base-300">
          <h2 className="text-xl font-bold text-base-content">
            翻訳元ファイル更新の確認
          </h2>
          <p className="text-sm text-base-content/70 mt-1">
            新しい翻訳元ファイルとの差分を検出しました
          </p>
        </div>

        {/* メインコンテンツ */}
        <div className="flex-1 overflow-y-auto p-6">
          {!hasChanges ? (
            <div className="text-center py-8">
              <div className="text-lg text-base-content/70 mb-2">
                変更はありませんでした
              </div>
              <p className="text-sm text-base-content/50">
                翻訳元ファイルに更新はありません
              </p>
            </div>
          ) : (
            <>
              {/* 統計情報 */}
              <div className="bg-base-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-3">変更概要</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.totalAdded > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-success">
                        {stats.totalAdded}
                      </div>
                      <div className="text-xs text-base-content/70">新規追加</div>
                    </div>
                  )}
                  {stats.totalModified > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-warning">
                        {stats.totalModified}
                      </div>
                      <div className="text-xs text-base-content/70">変更</div>
                    </div>
                  )}
                  {stats.totalDeleted > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-error">
                        {stats.totalDeleted}
                      </div>
                      <div className="text-xs text-base-content/70">削除</div>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-base-content/70">
                      {stats.totalUnchanged}
                    </div>
                    <div className="text-xs text-base-content/70">変更なし</div>
                  </div>
                </div>
                <div className="mt-3 text-sm text-base-content/70">
                  {summary}
                </div>
              </div>

              {/* 詳細表示 */}
              <div className="mb-6">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? "詳細を隠す" : "詳細を表示"}
                  <svg
                    className={`w-4 h-4 ml-1 transition-transform ${showDetails ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showDetails && (
                  <div className="mt-4 space-y-4">
                    {/* 新規追加 */}
                    {diff.added.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-success mb-2">
                          新規追加 ({diff.added.length}件)
                        </h4>
                        <div className="bg-success/10 border border-success/20 rounded p-3 max-h-32 overflow-y-auto">
                          {diff.added.slice(0, 10).map(key => (
                            <div key={key} className="text-sm font-mono">+ {key}</div>
                          ))}
                          {diff.added.length > 10 && (
                            <div className="text-xs text-base-content/50 mt-1">
                              他 {diff.added.length - 10} 件...
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 変更 */}
                    {diff.modified.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-warning mb-2">
                          変更 ({diff.modified.length}件)
                        </h4>
                        <div className="bg-warning/10 border border-warning/20 rounded p-3 max-h-32 overflow-y-auto">
                          {diff.modified.slice(0, 5).map(({ key, oldValue, newValue }) => (
                            <div key={key} className="text-sm mb-2">
                              <div className="font-mono font-semibold">{key}</div>
                              <div className="text-xs">
                                <span className="text-error">- {oldValue.substring(0, 50)}{oldValue.length > 50 ? "..." : ""}</span>
                              </div>
                              <div className="text-xs">
                                <span className="text-success">+ {newValue.substring(0, 50)}{newValue.length > 50 ? "..." : ""}</span>
                              </div>
                            </div>
                          ))}
                          {diff.modified.length > 5 && (
                            <div className="text-xs text-base-content/50 mt-1">
                              他 {diff.modified.length - 5} 件...
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 削除 */}
                    {diff.deleted.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-error mb-2">
                          削除 ({diff.deleted.length}件)
                        </h4>
                        <div className="bg-error/10 border border-error/20 rounded p-3 max-h-32 overflow-y-auto">
                          {diff.deleted.slice(0, 10).map(key => (
                            <div key={key} className="text-sm font-mono">- {key}</div>
                          ))}
                          {diff.deleted.length > 10 && (
                            <div className="text-xs text-base-content/50 mt-1">
                              他 {diff.deleted.length - 10} 件...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 更新オプション */}
              <div className="bg-base-200 rounded-lg p-4">
                <h3 className="font-semibold mb-3">更新オプション</h3>
                <div className="space-y-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={options.preserveDeletedKeys}
                      onChange={(e) => setOptions({
                        ...options,
                        preserveDeletedKeys: e.target.checked
                      })}
                    />
                    <span className="ml-3 text-sm">
                      削除されたキーを保持する
                      <div className="text-xs text-base-content/50">
                        削除されたキーにdeleteタグを付けて保持します
                      </div>
                    </span>
                  </label>

                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={options.autoApplyTags}
                      onChange={(e) => setOptions({
                        ...options,
                        autoApplyTags: e.target.checked
                      })}
                    />
                    <span className="ml-3 text-sm">
                      自動タグを適用する
                      <div className="text-xs text-base-content/50">
                        new/updated/deletedタグを自動で付与します
                      </div>
                    </span>
                  </label>

                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={options.preserveUserTags}
                      onChange={(e) => setOptions({
                        ...options,
                        preserveUserTags: e.target.checked
                      })}
                    />
                    <span className="ml-3 text-sm">
                      ユーザータグを保護する
                      <div className="text-xs text-base-content/50">
                        手動で付けたタグを保持します
                      </div>
                    </span>
                  </label>
                </div>
              </div>
            </>
          )}
        </div>

        {/* フッター */}
        <div className="p-6 border-t border-base-300 flex justify-end gap-3">
          <button
            className="btn btn-ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            キャンセル
          </button>
          {hasChanges && (
            <button
              className="btn btn-primary"
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  更新中...
                </>
              ) : (
                "更新を適用"
              )}
            </button>
          )}
          {!hasChanges && (
            <button
              className="btn btn-primary"
              onClick={onClose}
            >
              閉じる
            </button>
          )}
        </div>
      </div>
    </div>
  );
}