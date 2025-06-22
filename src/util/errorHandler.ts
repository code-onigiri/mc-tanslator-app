import toast from 'react-hot-toast';

export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}

export class AppErrorHandler {
  /**
   * エラーのログ記録
   */
  static logError(error: AppError): void {
    console.error(`[${error.timestamp.toISOString()}] ${error.code}: ${error.message}`, error.details);
  }

  /**
   * ユーザー向けエラーメッセージの生成
   */
  static getUserMessage(error: AppError): string {
    const errorMessages: Record<string, string> = {
      // Gemini API関連エラー
      INVALID_API_KEY: 'APIキーが無効です。設定を確認してください。',
      UNAUTHORIZED: 'API利用権限がありません。APIキーを確認してください。',
      RATE_LIMITED: 'API利用制限に達しました。しばらく待ってから再試行してください。',
      QUOTA_EXCEEDED: 'API利用枠を超過しました。プランを確認してください。',
      
      // ネットワーク関連エラー
      NETWORK_ERROR: 'ネットワーク接続を確認してください。',
      TIMEOUT_ERROR: 'リクエストがタイムアウトしました。再試行してください。',
      
      // 翻訳関連エラー
      EMPTY_TEXT: '翻訳するテキストを入力してください。',
      TEXT_TOO_LONG: 'テキストが長すぎます。短くしてから再試行してください。',
      UNSUPPORTED_LANGUAGE: 'サポートされていない言語です。',
      
      // 設定関連エラー
      MISSING_CONFIGURATION: 'APIキーが設定されていません。設定画面で設定してください。',
      INVALID_PROMPT: 'プロンプトテンプレートが無効です。',
      
      // 一般的なエラー
      UNKNOWN_ERROR: '予期しないエラーが発生しました。',
      SERVER_ERROR: 'サーバーエラーが発生しました。しばらく待ってから再試行してください。'
    };

    return errorMessages[error.code] || error.message || '予期しないエラーが発生しました。';
  }

  /**
   * エラーの処理と表示
   */
  static handleError(error: unknown, context?: string): AppError {
    let appError: AppError;

    if (error instanceof Error) {
      // Gemini APIエラーの場合
      if (error.name === 'GeminiAPIError') {
        const geminiError = error as { code?: string; details?: Record<string, unknown> };
        appError = {
          code: geminiError.code || 'API_ERROR',
          message: error.message,
          details: geminiError.details,
          timestamp: new Date()
        };
      } else {
        // その他のエラー
        appError = {
          code: 'UNKNOWN_ERROR',
          message: error.message,
          details: { originalError: error.name, context },
          timestamp: new Date()
        };
      }
    } else {
      // 不明なエラー
      appError = {
        code: 'UNKNOWN_ERROR',
        message: '予期しないエラーが発生しました',
        details: { originalError: error, context },
        timestamp: new Date()
      };
    }

    // ログ記録
    this.logError(appError);

    // ユーザーへの通知
    const userMessage = this.getUserMessage(appError);
    toast.error(userMessage);

    return appError;
  }

  /**
   * バリデーションエラーの処理
   */
  static handleValidationError(field: string, message: string): AppError {
    const error: AppError = {
      code: 'VALIDATION_ERROR',
      message: `${field}: ${message}`,
      details: { field },
      timestamp: new Date()
    };

    toast.error(message);
    this.logError(error);

    return error;
  }

  /**
   * 成功メッセージの表示
   */
  static showSuccess(message: string): void {
    toast.success(message);
  }

  /**
   * 情報メッセージの表示
   */
  static showInfo(message: string): void {
    toast(message, {
      icon: 'ℹ️',
    });
  }

  /**
   * 警告メッセージの表示
   */
  static showWarning(message: string): void {
    toast(message, {
      icon: '⚠️',
    });
  }
}

/**
 * エラーハンドリングのヘルパー関数
 */
export function withErrorHandling<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  context?: string
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>> | null> {
  return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>> | null> => {
    try {
      const result = await fn(...args);
      return result as Awaited<ReturnType<T>>;
    } catch (error) {
      AppErrorHandler.handleError(error, context);
      return null;
    }
  };
}

/**
 * リトライ機能付きエラーハンドリング
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  context?: string
): Promise<T | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        AppErrorHandler.handleError(error, `${context} (最終試行: ${attempt}/${maxRetries})`);
        return null;
      }

      // リトライ可能なエラーかチェック
      if (isRetryableError(error)) {
        AppErrorHandler.showWarning(`再試行中... (${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      } else {
        AppErrorHandler.handleError(error, context);
        return null;
      }
    }
  }

  return null;
}

/**
 * リトライ可能なエラーかどうかを判定
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const retryableCodes = [
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
      'RATE_LIMITED',
      'SERVER_ERROR'
    ];

    const errorWithCode = error as { code?: string };
    return retryableCodes.includes(errorWithCode.code || '');
  }
  return false;
}

// デフォルトエクスポート
export default AppErrorHandler;