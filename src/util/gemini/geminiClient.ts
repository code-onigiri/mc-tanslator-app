import { TranslationRequest, TranslationResponse, SUPPORTED_LANGUAGES, JSON_OUTPUT_PROMPT } from '../../types/gemini';

class GeminiAPIError extends Error {
  constructor(public code: string, message: string, public details?: Record<string, unknown>) {
    super(message);
    this.name = 'GeminiAPIError';
  }
}

export class GeminiClient {
  private static instance: GeminiClient;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

  private constructor() {}

  static getInstance(): GeminiClient {
    if (!GeminiClient.instance) {
      GeminiClient.instance = new GeminiClient();
    }
    return GeminiClient.instance;
  }

  /**
   * プロンプトテンプレートに変数を適用し、固定JSONプロンプトを追加
   */
  private applyPromptTemplate(
    template: string,
    sourceLanguage: string,
    targetLanguage: string,
    text: string
  ): string {
    const sourceLanguageName = SUPPORTED_LANGUAGES[sourceLanguage as keyof typeof SUPPORTED_LANGUAGES] || sourceLanguage;
    const targetLanguageName = SUPPORTED_LANGUAGES[targetLanguage as keyof typeof SUPPORTED_LANGUAGES] || targetLanguage;
    
    // カスタムプロンプトに変数を適用
    const customPrompt = template
      .replace(/{sourceLanguage}/g, sourceLanguageName)
      .replace(/{targetLanguage}/g, targetLanguageName)
      .replace(/{text}/g, text);
    
    // カスタムプロンプト + 固定JSONプロンプトを結合
    return customPrompt + JSON_OUTPUT_PROMPT;
  }

  /**
   * APIキーの検証
   */
  private validateApiKey(apiKey: string): void {
    if (!apiKey || apiKey.trim() === '') {
      throw new GeminiAPIError('INVALID_API_KEY', 'APIキーが設定されていません');
    }
    if (!apiKey.startsWith('AIza')) {
      throw new GeminiAPIError('INVALID_API_KEY', 'APIキーの形式が正しくありません');
    }
  }

  /**
   * エラーレスポンスの処理
   */
  private handleApiError(error: unknown): never {
    if (error instanceof GeminiAPIError) {
      throw error;
    }

    // ネットワークエラー
    if (!navigator.onLine) {
      throw new GeminiAPIError('NETWORK_ERROR', 'インターネット接続を確認してください');
    }

    // HTTPエラー
    if (error && typeof error === 'object' && 'status' in error) {
      const httpError = error as { status: number };
      switch (httpError.status) {
        case 400:
          throw new GeminiAPIError('BAD_REQUEST', 'リクエストの形式が正しくありません');
        case 401:
          throw new GeminiAPIError('UNAUTHORIZED', 'APIキーが無効です');
        case 403:
          throw new GeminiAPIError('FORBIDDEN', 'API利用権限がありません');
        case 429:
          throw new GeminiAPIError('RATE_LIMITED', 'APIの利用制限に達しました。しばらく待ってから再試行してください');
        case 500:
          throw new GeminiAPIError('SERVER_ERROR', 'サーバーエラーが発生しました');
        default:
          throw new GeminiAPIError('API_ERROR', `APIエラー: ${httpError.status}`);
      }
    }

    // その他のエラー
    throw new GeminiAPIError('UNKNOWN_ERROR', '予期しないエラーが発生しました');
  }

  /**
   * 翻訳実行
   */
  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    try {
      // APIキー検証
      this.validateApiKey(request.settings.apiKey);

      // プロンプト作成（カスタムプロンプト + 固定JSONプロンプト）
      const prompt = this.applyPromptTemplate(
        request.customPrompt || request.settings.customPrompt,
        request.sourceLanguage,
        request.targetLanguage,
        request.text
      );

      // API リクエスト構築
      const apiUrl = `${this.baseUrl}/${request.settings.model}:generateContent?key=${request.settings.apiKey}`;
      
      const requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: request.settings.temperature,
          maxOutputTokens: request.settings.maxTokens,
          candidateCount: 1
        }
      };

      // API呼び出し
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new GeminiAPIError(
          'API_ERROR',
          errorData.error?.message || `HTTP ${response.status}`,
          errorData
        );
      }

      const data = await response.json();

      // レスポンス検証
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new GeminiAPIError('INVALID_RESPONSE', '翻訳結果を取得できませんでした');
      }

      const rawResponse = data.candidates[0].content.parts[0].text;
      
      if (!rawResponse || rawResponse.trim() === '') {
        throw new GeminiAPIError('EMPTY_RESPONSE', '翻訳結果が空です');
      }

      // JSON形式のレスポンスを解析
      let translatedText = rawResponse.trim();
      let candidates: Record<string, string> | undefined;

      try {
        // ```json や ``` で囲まれたJSONを抽出
        let jsonString = rawResponse.trim();
        
        // ```json で始まる場合の処理
        if (jsonString.includes('```json')) {
          const startIndex = jsonString.indexOf('```json') + 7;
          const endIndex = jsonString.lastIndexOf('```');
          if (endIndex > startIndex) {
            jsonString = jsonString.substring(startIndex, endIndex).trim();
          }
        }
        // ``` で囲まれている場合の処理
        else if (jsonString.includes('```')) {
          const startIndex = jsonString.indexOf('```') + 3;
          const endIndex = jsonString.lastIndexOf('```');
          if (endIndex > startIndex) {
            jsonString = jsonString.substring(startIndex, endIndex).trim();
          }
        }
        
        // JSON部分のみを抽出（{ から } まで）
        const jsonStart = jsonString.indexOf('{');
        const jsonEnd = jsonString.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          jsonString = jsonString.substring(jsonStart, jsonEnd + 1);
        }

        if (jsonString.startsWith('{')) {
          const jsonResponse = JSON.parse(jsonString);
          
          // 新しい形式 {"選択肢1": "翻訳1", "選択肢2": "翻訳2", "選択肢3": "翻訳3"}
          if (typeof jsonResponse === 'object' && !Array.isArray(jsonResponse)) {
            candidates = jsonResponse;
            // 最初の翻訳を選択
            const firstKey = Object.keys(jsonResponse)[0];
            if (firstKey) {
              translatedText = jsonResponse[firstKey];
            }
          }
        }
      } catch (jsonError) {
        // JSON解析に失敗した場合は、生のテキストを使用
        console.warn('JSON解析に失敗しました、生のテキストを使用します:', jsonError);
        console.warn('元のレスポンス:', rawResponse);
      }

      // 使用量情報の取得（利用可能な場合）
      const usage = data.usageMetadata ? {
        promptTokens: data.usageMetadata.promptTokenCount || 0,
        completionTokens: data.usageMetadata.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata.totalTokenCount || 0
      } : undefined;

      return {
        translatedText,
        candidates,
        model: request.settings.model,
        usage
      };

    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * APIキーのテスト
   */
  async testApiKey(apiKey: string, model: string = 'gemini-1.5-flash'): Promise<boolean> {
    try {
      this.validateApiKey(apiKey);

      const testRequest: TranslationRequest = {
        text: 'Hello',
        sourceLanguage: 'en',
        targetLanguage: 'ja',
        settings: {
          apiKey,
          model: model as 'gemini-1.5-flash' | 'gemini-1.5-pro',
          temperature: 0.3,
          maxTokens: 100,
          customPrompt: 'Translate "{text}" from {sourceLanguage} to {targetLanguage}:'
        }
      };

      await this.translate(testRequest);
      return true;
    } catch {
      return false;
    }
  }
}

// シングルトンインスタンスをエクスポート
export const geminiClient = GeminiClient.getInstance();