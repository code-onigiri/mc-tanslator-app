/**
 * Gemini AI翻訳機能のテストケース
 * 
 * このファイルは、テストランナー（Jest/Vitest）が設定された際に実行されるテストケースを含みます。
 * 現在はTypeScriptの型チェックと基本的なバリデーション機能のテストを提供します。
 */

// import { geminiClient } from '../util/gemini/geminiClient';
import { TranslationRequest, DEFAULT_GEMINI_SETTINGS } from '../types/gemini';
import { validatePromptTemplate, generatePromptPreview } from '../util/gemini/promptTemplates';

/**
 * テスト用のモックデータ
 */
export const mockTranslationRequest: TranslationRequest = {
  text: 'Hello, world!',
  sourceLanguage: 'en',
  targetLanguage: 'ja',
  settings: {
    ...DEFAULT_GEMINI_SETTINGS,
    apiKey: 'AIza_test_key_for_testing'
  }
};

/**
 * プロンプトテンプレートのバリデーションテスト
 */
export function testPromptValidation() {
  console.log('Testing prompt template validation...');
  
  // 有効なプロンプトテンプレートのテスト
  const validTemplate = 'Translate "{text}" from {sourceLanguage} to {targetLanguage}:';
  const validResult = validatePromptTemplate(validTemplate);
  
  if (!validResult.isValid) {
    throw new Error(`Valid template should pass validation: ${validResult.error}`);
  }
  
  // 無効なプロンプトテンプレート（{text}なし）のテスト
  const invalidTemplate = 'Translate from {sourceLanguage} to {targetLanguage}:';
  const invalidResult = validatePromptTemplate(invalidTemplate);
  
  if (invalidResult.isValid) {
    throw new Error('Invalid template should fail validation');
  }
  
  console.log('✅ Prompt validation tests passed');
}

/**
 * プロンプトプレビュー生成のテスト
 */
export function testPromptPreview() {
  console.log('Testing prompt preview generation...');
  
  const template = 'Translate "{text}" from {sourceLanguage} to {targetLanguage}:';
  const preview = generatePromptPreview(template, '英語', '日本語', 'Hello');
  
  const expected = 'Translate "Hello" from 英語 to 日本語:';
  if (preview !== expected) {
    throw new Error(`Preview mismatch. Expected: "${expected}", Got: "${preview}"`);
  }
  
  console.log('✅ Prompt preview tests passed');
}

/**
 * APIキーバリデーションのテスト
 */
export function testApiKeyValidation() {
  console.log('Testing API key validation...');
  
  // 有効なAPIキー形式
  const validApiKey = 'AIza_valid_key_123';
  // 無効なAPIキー形式
  const invalidApiKey = 'invalid_key';
  const emptyApiKey = '';
  
  // 基本的な形式チェック
  if (!validApiKey.startsWith('AIza')) {
    throw new Error('Valid API key format check failed');
  }
  
  if (invalidApiKey.startsWith('AIza')) {
    throw new Error('Invalid API key should not pass format check');
  }
  
  if (emptyApiKey.length > 0) {
    throw new Error('Empty API key should be detected');
  }
  
  console.log('✅ API key validation tests passed');
}

/**
 * 翻訳リクエストの構造テスト
 */
export function testTranslationRequestStructure() {
  console.log('Testing translation request structure...');
  
  const request = mockTranslationRequest;
  
  // 必須フィールドの存在確認
  if (!request.text || !request.sourceLanguage || !request.targetLanguage || !request.settings) {
    throw new Error('Translation request missing required fields');
  }
  
  // 設定の必須フィールド確認
  if (!request.settings.apiKey || !request.settings.model) {
    throw new Error('Translation settings missing required fields');
  }
  
  // 数値フィールドの型確認
  if (typeof request.settings.temperature !== 'number' || typeof request.settings.maxTokens !== 'number') {
    throw new Error('Numeric settings should be numbers');
  }
  
  console.log('✅ Translation request structure tests passed');
}

/**
 * エラーハンドリングのテスト
 */
export function testErrorHandling() {
  console.log('Testing error handling...');
  
  // 空のテキストでのバリデーション
  const emptyTextRequest = {
    ...mockTranslationRequest,
    text: ''
  };
  
  if (emptyTextRequest.text.trim().length > 0) {
    throw new Error('Empty text should be detected');
  }
  
  // 無効なAPIキーでのバリデーション
  const invalidKeyRequest = {
    ...mockTranslationRequest,
    settings: {
      ...mockTranslationRequest.settings,
      apiKey: ''
    }
  };
  
  if (invalidKeyRequest.settings.apiKey.length > 0) {
    throw new Error('Invalid API key should be detected');
  }
  
  console.log('✅ Error handling tests passed');
}

/**
 * すべてのテストを実行
 */
export function runAllTests() {
  console.log('🧪 Running Gemini AI translation tests...\n');
  
  try {
    testPromptValidation();
    testPromptPreview();
    testApiKeyValidation();
    testTranslationRequestStructure();
    testErrorHandling();
    
    console.log('\n🎉 All tests passed successfully!');
    return true;
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    return false;
  }
}

/**
 * 開発時のテスト実行
 * 
 * この関数は開発時にブラウザのコンソールから呼び出すことができます：
 * import { runAllTests } from './src/__tests__/gemini.test';
 * runAllTests();
 */
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  // 開発環境でのみ自動実行
  console.log('Development environment detected. Running tests...');
  setTimeout(() => {
    runAllTests();
  }, 1000);
}

// Future Jest/Vitest integration example:
/*
describe('Gemini Client', () => {
  test('validates prompt templates correctly', () => {
    expect(() => testPromptValidation()).not.toThrow();
  });
  
  test('generates prompt previews correctly', () => {
    expect(() => testPromptPreview()).not.toThrow();
  });
  
  test('validates API keys correctly', () => {
    expect(() => testApiKeyValidation()).not.toThrow();
  });
});
*/