// 一括AI翻訳用型定義

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