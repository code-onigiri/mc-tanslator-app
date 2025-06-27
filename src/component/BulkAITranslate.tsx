import React, { useState, useRef } from "react";
import { translateData } from "../util/file/fileop";
import { BulkTranslateMode, BulkTranslateRequest, BulkTranslateResult, BulkTranslateProgress } from "../types/bulkTranslate";
import { bulkTranslate } from "../util/ai/bulkTranslate";
import { useGeminiStore } from "./stores/GeminiStore";
import { GeminiSettings } from "../types/gemini";

const BulkAITranslate: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<BulkTranslateMode>("untranslated");
  const [progress, setProgress] = useState<(BulkTranslateProgress & { retrying?: boolean; retryCount?: number }) | null>(null);
  const [results, setResults] = useState<BulkTranslateResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // ストアからデータ取得
  const source = translateData.getState().translateSource || {};
  const target = translateData.getState().translateTarget || {};
  const keys = Object.keys(source);

  // Gemini設定
  const { settings, promptTemplates, selectedTemplateId, isConfigured } = useGeminiStore();

  const handleStart = async () => {
    setIsRunning(true);
    setError(null);
    setResults(null);
    setProgress({ total: 0, completed: 0, failed: 0 });
    const abortController = new AbortController();
    abortRef.current = abortController;

    // プロンプト決定
    let prompt = settings.customPrompt;
    if (selectedTemplateId) {
      const selected = promptTemplates.find(t => t.id === selectedTemplateId);
      if (selected) prompt = selected.template;
    }

    // 言語設定（現状はデフォルト: en→ja。将来的にUIで拡張可）
    const sourceLang = "en";
    const targetLang = "ja";

    const req: BulkTranslateRequest = {
      keys,
      source,
      target,
      mode,
      sourceLang,
      targetLang,
      prompt,
    };

    try {
      const res = await bulkTranslate(
        req,
        (p) => setProgress({ ...p }),
        settings as GeminiSettings,
        abortController.signal
      );
      setResults(res);
      // 成功分のみ反映
      const updated = { ...target };
      res.forEach(r => {
        if (r.success) updated[r.key] = r.translated;
      });
      translateData.getState().settranslateTarget(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsRunning(false);
      abortRef.current = null;
    }
  };

  const handleCancel = () => {
    abortRef.current?.abort();
    setIsRunning(false);
  };

  return (
    <>
      <button className="btn btn-primary w-full" onClick={() => setOpen(true)}>
        一括AI翻訳
      </button>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">一括AI翻訳</h2>
            <div className="mb-4">
              <label className="font-medium mr-4">翻訳対象</label>
              <label>
                <input
                  type="radio"
                  checked={mode === "untranslated"}
                  onChange={() => setMode("untranslated")}
                  disabled={isRunning}
                />
                未翻訳のみ
              </label>
              <label className="ml-4">
                <input
                  type="radio"
                  checked={mode === "all"}
                  onChange={() => setMode("all")}
                  disabled={isRunning}
                />
                全体
              </label>
            </div>
            {progress && (
              <div className="mb-2">
                <div>進捗: {progress.completed} / {progress.total}（失敗: {progress.failed}）</div>
                {progress.currentKey && <div className="text-xs text-gray-500">現在: {progress.currentKey}</div>}
                {progress.retrying && (
                  <div className="text-xs text-orange-500">
                    レート制限でリトライ中（{progress.retryCount}回目）…待機しています
                  </div>
                )}
              </div>
            )}
            {error && <div className="text-red-500 mb-2">{error}</div>}
            {results && (
              <div className="mb-2 text-sm">
                完了: {results.filter(r => r.success).length}件 / 失敗: {results.filter(r => !r.success).length}件
              </div>
            )}
            <div className="flex justify-end space-x-2 mt-4">
              <button className="btn" onClick={() => setOpen(false)} disabled={isRunning}>
                閉じる
              </button>
              {!isRunning && (
                <button className="btn btn-primary" onClick={handleStart} disabled={!isConfigured()}>
                  実行
                </button>
              )}
              {isRunning && (
                <button className="btn btn-warning" onClick={handleCancel}>
                  キャンセル
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkAITranslate;