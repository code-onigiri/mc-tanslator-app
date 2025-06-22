import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useGeminiStore } from './stores/GeminiStore';
import { geminiClient } from '../util/gemini/geminiClient';
import { PromptTemplate } from '../types/gemini';

export default function GeminiSettings() {
  const {
    settings,
    promptTemplates,
    selectedTemplateId,
    updateSettings,
    resetSettings,
    addPromptTemplate,
    selectPromptTemplate,
    isConfigured
  } = useGeminiStore();

  const [isTestingApiKey, setIsTestingApiKey] = useState(false);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [newPromptTemplate, setNewPromptTemplate] = useState<Omit<PromptTemplate, 'id'>>({
    name: '',
    template: '',
    description: '',
    category: 'general'
  });

  // APIキーのテスト
  const testApiKey = async () => {
    if (!settings.apiKey) {
      toast.error('APIキーを入力してください');
      return;
    }

    setIsTestingApiKey(true);
    try {
      const isValid = await geminiClient.testApiKey(settings.apiKey, settings.model);
      if (isValid) {
        toast.success('APIキーが有効です');
      } else {
        toast.error('APIキーが無効です');
      }
    } catch {
      toast.error('APIキーのテストに失敗しました');
    } finally {
      setIsTestingApiKey(false);
    }
  };

  // カスタムプロンプトテンプレートの追加
  const handleAddPromptTemplate = () => {
    if (!newPromptTemplate.name || !newPromptTemplate.template) {
      toast.error('名前とテンプレートを入力してください');
      return;
    }

    addPromptTemplate(newPromptTemplate);
    setNewPromptTemplate({
      name: '',
      template: '',
      description: '',
      category: 'general'
    });
    setIsEditingPrompt(false);
    toast.success('プロンプトテンプレートを追加しました');
  };

  // 設定のリセット
  const handleResetSettings = () => {
    if (confirm('設定をリセットしますか？この操作は元に戻せません。')) {
      resetSettings();
      toast.success('設定をリセットしました');
    }
  };

  const selectedTemplate = promptTemplates.find(t => t.id === selectedTemplateId);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Gemini AI設定</h2>

      {/* 設定状況の表示 */}
      <div className={`alert ${isConfigured() ? 'alert-success' : 'alert-warning'} mb-6`}>
        <div>
          <h3 className="font-bold">
            {isConfigured() ? '✅ 設定完了' : '⚠️ 設定が必要'}
          </h3>
          <div className="text-sm">
            {isConfigured() 
              ? 'Gemini AIが使用可能です' 
              : 'APIキーを設定してください'
            }
          </div>
        </div>
      </div>

      {/* API設定 */}
      <div className="card bg-base-100 shadow-lg mb-6">
        <div className="card-body">
          <h3 className="card-title">API設定</h3>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text">Gemini APIキー</span>
              <span className="label-text-alt">
                <a 
                  href="https://makersuite.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="link link-primary"
                >
                  APIキーを取得
                </a>
              </span>
            </label>
            <div className="input-group">
              <input
                type="password"
                placeholder="AIza..."
                className="input input-bordered flex-1"
                value={settings.apiKey}
                onChange={(e) => updateSettings({ apiKey: e.target.value })}
              />
              <button
                className={`btn btn-primary ${isTestingApiKey ? 'loading' : ''}`}
                onClick={testApiKey}
                disabled={!settings.apiKey || isTestingApiKey}
              >
                {isTestingApiKey ? 'テスト中...' : 'テスト'}
              </button>
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">モデル</span>
            </label>
            <select
              className="select select-bordered"
              value={settings.model}
              onChange={(e) => updateSettings({ model: e.target.value as 'gemini-1.5-flash' | 'gemini-1.5-pro' })}
            >
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (高速・安価)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (高品質)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">温度 (創造性)</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                className="range range-primary"
                value={settings.temperature}
                onChange={(e) => updateSettings({ temperature: parseFloat(e.target.value) })}
              />
              <div className="w-full flex justify-between text-xs px-2">
                <span>保守的</span>
                <span>{settings.temperature}</span>
                <span>創造的</span>
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">最大トークン数</span>
              </label>
              <input
                type="number"
                className="input input-bordered"
                min="100"
                max="8192"
                value={settings.maxTokens}
                onChange={(e) => updateSettings({ maxTokens: parseInt(e.target.value) })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* プロンプトテンプレート設定 */}
      <div className="card bg-base-100 shadow-lg mb-6">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h3 className="card-title">プロンプトテンプレート</h3>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => setIsEditingPrompt(!isEditingPrompt)}
            >
              {isEditingPrompt ? 'キャンセル' : '新規作成'}
            </button>
          </div>

          {/* 現在選択中のテンプレート */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">使用中のテンプレート</span>
            </label>
            <select
              className="select select-bordered"
              value={selectedTemplateId || ''}
              onChange={(e) => selectPromptTemplate(e.target.value || null)}
            >
              {promptTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.category})
                </option>
              ))}
            </select>
          </div>

          {/* 選択中テンプレートのプレビュー */}
          {selectedTemplate && (
            <div className="bg-base-200 p-4 rounded-lg mb-4">
              <h4 className="font-semibold mb-2">{selectedTemplate.name}</h4>
              <p className="text-sm text-base-content/70 mb-2">{selectedTemplate.description}</p>
              <pre className="text-xs bg-base-300 p-2 rounded overflow-x-auto">
                {selectedTemplate.template}
              </pre>
            </div>
          )}

          {/* 新規プロンプトテンプレート作成 */}
          {isEditingPrompt && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border border-base-300 p-4 rounded-lg"
            >
              <h4 className="font-semibold mb-4">新しいプロンプトテンプレート</h4>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">名前</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={newPromptTemplate.name}
                    onChange={(e) => setNewPromptTemplate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="テンプレート名"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">カテゴリ</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={newPromptTemplate.category}
                    onChange={(e) => setNewPromptTemplate(prev => ({ 
                      ...prev, 
                      category: e.target.value as 'general' | 'technical' | 'literary' | 'business'
                    }))}
                  >
                    <option value="general">一般</option>
                    <option value="technical">技術</option>
                    <option value="business">ビジネス</option>
                    <option value="literary">文学</option>
                  </select>
                </div>
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">説明</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={newPromptTemplate.description}
                  onChange={(e) => setNewPromptTemplate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="テンプレートの説明"
                />
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">プロンプトテンプレート</span>
                  <span className="label-text-alt">
                    使用可能な変数: {'{sourceLanguage}'}, {'{targetLanguage}'}, {'{text}'}
                  </span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-32"
                  value={newPromptTemplate.template}
                  onChange={(e) => setNewPromptTemplate(prev => ({ ...prev, template: e.target.value }))}
                  placeholder="プロンプトテンプレートを入力..."
                />
              </div>

              <div className="flex gap-2">
                <button
                  className="btn btn-primary"
                  onClick={handleAddPromptTemplate}
                >
                  追加
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => setIsEditingPrompt(false)}
                >
                  キャンセル
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex justify-end gap-4">
        <button
          className="btn btn-error btn-outline"
          onClick={handleResetSettings}
        >
          設定をリセット
        </button>
      </div>
    </div>
  );
}