// Gemini API関連の型定義

export interface GeminiSettings {
  apiKey: string;
  model: 'gemini-1.5-flash' | 'gemini-1.5-pro';
  temperature: number;
  maxTokens: number;
  customPrompt: string;
}

export interface TranslationRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  customPrompt?: string;
  settings: GeminiSettings;
}

export interface TranslationResponse {
  translatedText: string;
  candidates?: Record<string, string>; // {"選択肢1": "翻訳1", "選択肢2": "翻訳2"}
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface GeminiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  description: string;
  category: 'general' | 'technical' | 'literary' | 'business';
}

// JSON形式で返答させる固定プロンプト
export const JSON_OUTPUT_PROMPT = `

必ずこの形式のJSONで回答してください:
{
  "選択肢1": "翻訳候補1",
  "選択肢2": "翻訳候補2",
  "選択肢3": "翻訳候補3"
}

JSON以外は出力しないでください。`;

export const DEFAULT_GEMINI_SETTINGS: GeminiSettings = {
  apiKey: '',
  model: 'gemini-1.5-flash',
  temperature: 0.2,
  maxTokens: 1024,
  customPrompt: 'あなたはMinecraft専門の翻訳者です。以下のMinecraftテキストを{sourceLanguage}から{targetLanguage}に翻訳してください。\n\nMinecraftの用語、アイテム名、ブロック名、エンチャント名、バイオーム名などは公式日本語版に合わせて翻訳してください。コマンドの場合は構文を変更せず説明部分のみ翻訳してください。\n\n原文: {text}'
};

export const SUPPORTED_LANGUAGES = {
  'ja': '日本語',
  'en': '英語',
  'zh': '中国語',
  'fr': 'フランス語',
  'de': 'ドイツ語',
  'es': 'スペイン語',
  'ko': '韓国語',
  'it': 'イタリア語',
  'pt': 'ポルトガル語',
  'ru': 'ロシア語'
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;