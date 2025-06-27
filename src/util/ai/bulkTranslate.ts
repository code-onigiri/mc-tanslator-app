// 並列AI一括翻訳ユーティリティ（1分あたり15件レートリミット対応）
import { BulkTranslateRequest, BulkTranslateResult, BulkTranslateProgress } from "../../types/bulkTranslate";
import { geminiClient } from "../gemini/geminiClient";
import { GeminiSettings } from "../../types/gemini";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function bulkTranslate(
  req: BulkTranslateRequest,
  onProgress: (p: BulkTranslateProgress & { retrying?: boolean; retryCount?: number }) => void,
  settings: GeminiSettings,
  signal?: AbortSignal
): Promise<BulkTranslateResult[]> {
  const keys =
    req.mode === "all"
      ? req.keys
      : req.keys.filter((key) => !req.target[key] || req.target[key].trim() === "");
  const results: BulkTranslateResult[] = [];
  let completed = 0, failed = 0;

  // 並列数制御用キュー
  const queue = [...keys];
  let isAborted = false;

  // レートリミット: 1分あたり最大15件
  const MAX_PER_MINUTE = 15;
  let sentInCurrentMinute = 0;
  let minuteWindowStart = Date.now();

  // 429リトライ設定
  const MAX_RETRIES = 5;
  const BASE_BACKOFF = 1000; // 1秒

  const runNext = async (): Promise<void> => {
    if (isAborted) return;
    const key = queue.shift();
    if (!key) return;
    try {
      if (signal?.aborted) {
        isAborted = true;
        return;
      }
      // 1分あたり15件制御
      const now = Date.now();
      if (now - minuteWindowStart >= 60_000) {
        // 新しいウィンドウ
        sentInCurrentMinute = 0;
        minuteWindowStart = now;
      }
      if (sentInCurrentMinute >= MAX_PER_MINUTE) {
        const wait = 60_000 - (now - minuteWindowStart);
        onProgress({
          total: keys.length,
          completed,
          failed,
          currentKey: key,
          retrying: true,
          retryCount: 0
        });
        await sleep(wait);
        sentInCurrentMinute = 0;
        minuteWindowStart = Date.now();
      }
      sentInCurrentMinute++;

      let retryCount = 0;
      while (retryCount <= MAX_RETRIES) {
        try {
          const res = await geminiClient.translate({
            text: req.source[key],
            sourceLanguage: req.sourceLang,
            targetLanguage: req.targetLang,
            customPrompt: req.prompt,
            settings
          });
          results.push({ key, translated: res.translatedText, success: true });
          break;
        } catch (e: unknown) {
          let errMsg = "Unknown error";
          if (e instanceof Error) errMsg = e.message;
          // 429判定
          if (
            typeof errMsg === "string" &&
            (errMsg.includes("429") || errMsg.includes("Too Many Requests"))
          ) {
            retryCount++;
            if (retryCount > MAX_RETRIES) {
              results.push({ key, translated: "", success: false, error: "429 Too Many Requests (最大リトライ超過)" });
              failed++;
              break;
            }
            onProgress({
              total: keys.length,
              completed,
              failed,
              currentKey: key,
              retrying: true,
              retryCount
            });
            await sleep(BASE_BACKOFF * Math.pow(2, retryCount - 1));
            continue;
          } else {
            results.push({ key, translated: "", success: false, error: errMsg });
            failed++;
            break;
          }
        }
      }
    } finally {
      completed++;
      onProgress({ total: keys.length, completed, failed, currentKey: key });
      await runNext();
    }
  };

  // 並列実行
  await Promise.all(Array(5).fill(0).map(runNext));
  return results;
}