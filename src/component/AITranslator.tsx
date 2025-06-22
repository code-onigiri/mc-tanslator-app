import { useState } from "react";
import { useGeminiStore } from "./stores/GeminiStore";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { geminiClient } from "../util/gemini/geminiClient";
import { SUPPORTED_LANGUAGES, SupportedLanguage } from "../types/gemini";
import { TranslationLoading } from "./LoadingIndicator";
import AppErrorHandler from "../util/errorHandler";

function MinecraftAITranslator() {
  // Geminiストアから設定を取得
  const { settings, promptTemplates, selectedTemplateId, isConfigured } = useGeminiStore();
  
  // 翻訳入力テキスト
  const [inputText, setInputText] = useState("");
  // 翻訳結果候補
  const [translationCandidates, setTranslationCandidates] = useState<Record<string, string>>({});
  // 選択された翻訳結果
  const [selectedTranslation, setSelectedTranslation] = useState<string>("");
  // ローディング状態
  const [isLoading, setIsLoading] = useState(false);
  // 選択された翻訳言語
  const [sourceLanguage, setSourceLanguage] = useState<SupportedLanguage>("en");
  const [targetLanguage, setTargetLanguage] = useState<SupportedLanguage>("ja");
  // キャンセル機能
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // 翻訳のキャンセル
  const handleCancel = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    setIsLoading(false);
    AppErrorHandler.showInfo("翻訳がキャンセルされました");
  };

  // 翻訳実行の処理
  const handleTranslate = async () => {
    if (!inputText.trim()) {
      AppErrorHandler.handleValidationError("翻訳テキスト", "翻訳するテキストを入力してください");
      return;
    }

    if (!isConfigured()) {
      AppErrorHandler.handleValidationError("設定", "Gemini APIの設定が必要です。設定画面でAPIキーを入力してください。");
      return;
    }

    // 新しいAbortControllerを作成
    const newAbortController = new AbortController();
    setAbortController(newAbortController);
    setIsLoading(true);
    setTranslationCandidates({});
    setSelectedTranslation("");

    try {
      // 使用するプロンプトを決定
      let promptToUse = settings.customPrompt;
      if (selectedTemplateId) {
        const selectedTemplate = promptTemplates.find(t => t.id === selectedTemplateId);
        if (selectedTemplate) {
          promptToUse = selectedTemplate.template;
        }
      }

      const result = await geminiClient.translate({
        text: inputText,
        sourceLanguage,
        targetLanguage,
        customPrompt: promptToUse,
        settings
      });

      // 翻訳候補を設定
      if (result.candidates && Object.keys(result.candidates).length > 0) {
        setTranslationCandidates(result.candidates);
        // 最初の翻訳を選択
        const firstKey = Object.keys(result.candidates)[0];
        setSelectedTranslation(result.candidates[firstKey]);
      } else {
        // JSON形式でない場合の処理
        setSelectedTranslation(result.translatedText);
        setTranslationCandidates({
          "結果": result.translatedText
        });
      }

      AppErrorHandler.showSuccess("翻訳が完了しました！");
      
      // 使用量情報の表示（利用可能な場合）
      if (result.usage) {
        console.log('Token使用量:', result.usage);
      }
    } catch (error) {
      // キャンセルの場合はエラーハンドリングをスキップ
      if (newAbortController.signal.aborted) {
        return;
      }
      AppErrorHandler.handleError(error, 'Minecraft AI翻訳');
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  // 翻訳候補を選択
  const selectCandidate = (key: string, translation: string) => {
    setSelectedTranslation(translation);
    toast.success(`「${key}」を選択しました`);
  };

  // 結果をクリップボードにコピー
  const copyToClipboard = () => {
    if (selectedTranslation) {
      navigator.clipboard.writeText(selectedTranslation);
      toast.success("翻訳結果をコピーしました");
    }
  };


  return (
    <>
      <TranslationLoading
        isLoading={isLoading}
        onCancel={handleCancel}
        model={settings.model}
      />
      
      <div className="flex flex-col h-full p-4 overflow-hidden">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-xl font-bold">Minecraft AI翻訳</h2>
          <div className="badge badge-primary badge-sm">AI</div>
        </div>

        {/* 設定状態の表示 */}
        {!isConfigured() && (
          <div className="alert alert-warning mb-6">
            <div>
              <strong>設定が必要です</strong>
              <div className="text-sm">設定画面でGemini APIキーを入力してください</div>
            </div>
          </div>
        )}

        <div className="space-y-6 flex-1 overflow-y-auto">
          {/* 翻訳入力エリア */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-header p-4 border-b border-base-300">
              <h3 className="text-lg font-semibold">翻訳入力</h3>
            </div>
            <div className="card-body p-4 space-y-4">
              {/* 言語選択 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">翻訳元</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={sourceLanguage}
                    onChange={(e) => setSourceLanguage(e.target.value as SupportedLanguage)}
                  >
                    {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">翻訳先</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value as SupportedLanguage)}
                  >
                    {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* プロンプト選択 */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">翻訳タイプ</span>
                </label>
                <div className="bg-base-200 p-3 rounded-lg">
                  <div className="text-sm font-medium">
                    {selectedTemplateId ? 
                      promptTemplates.find(t => t.id === selectedTemplateId)?.name || '不明' :
                      'デフォルト'
                    }
                  </div>
                  <div className="text-xs text-base-content/70 mt-1">
                    {selectedTemplateId ? 
                      promptTemplates.find(t => t.id === selectedTemplateId)?.description || '' :
                      'Minecraft専用AI翻訳'
                    }
                  </div>
                </div>
              </div>

              {/* 入力エリア */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">翻訳するテキスト</span>
                  <span className="label-text-alt">{inputText.length}/500文字</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-32 resize-none text-base"
                  placeholder="Minecraftのテキストを入力してください..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value.slice(0, 500))}
                  disabled={isLoading}
                />
              </div>

              {/* 翻訳実行ボタン */}
              <button
                className={`btn btn-primary w-full ${isLoading ? "loading" : ""}`}
                onClick={handleTranslate}
                disabled={isLoading || !inputText.trim() || !isConfigured()}
              >
                {isLoading ? "翻訳中..." : "AI翻訳実行"}
              </button>
            </div>
          </div>

          {/* 翻訳候補結果エリア */}
          {Object.keys(translationCandidates).length > 0 && (
            <div className="card bg-base-100 shadow-lg">
              <div className="card-header p-4 border-b border-base-300">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  翻訳候補
                  <div className="badge badge-primary badge-sm ml-2">
                    {Object.keys(translationCandidates).length}件
                  </div>
                </h3>
              </div>
              <div className="card-body p-4">
                <div className="space-y-3">
                  <AnimatePresence>
                    {Object.entries(translationCandidates).map(([key, translation], index) => (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-lg cursor-pointer transition-all border-2 flex items-center justify-between ${
                          selectedTranslation === translation
                            ? 'border-primary bg-primary/10 shadow-md'
                            : 'border-base-300 hover:border-base-400 bg-base-50 hover:shadow-sm'
                        }`}
                        onClick={() => selectCandidate(key, translation)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="badge badge-outline badge-sm">
                              {key}
                            </span>
                            {selectedTranslation === translation && (
                              <span className="badge badge-primary badge-sm">選択中</span>
                            )}
                          </div>
                          
                          <div className="text-base leading-relaxed">
                            {translation}
                          </div>
                        </div>
                        
                        <div className="flex-shrink-0 ml-4">
                          {selectedTranslation === translation ? (
                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-primary-content text-xs">✓</span>
                            </div>
                          ) : (
                            <div className="w-6 h-6 border-2 border-base-300 rounded-full"></div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}

          {/* 選択された翻訳結果 */}
          {selectedTranslation && (
            <div className="card bg-base-100 shadow-lg">
              <div className="card-header p-4 border-b border-base-300">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  選択された翻訳
                  <button
                    className="btn btn-ghost btn-sm ml-auto"
                    onClick={copyToClipboard}
                  >
                    コピー
                  </button>
                </h3>
              </div>
              <div className="card-body p-4">
                <div className="bg-success/10 border border-success/30 rounded-lg p-4">
                  <div className="text-base leading-relaxed">
                    {selectedTranslation}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 使用方法ガイド */}
          {Object.keys(translationCandidates).length === 0 && (
            <div className="card bg-base-100 shadow-lg">
              <div className="card-header p-4 border-b border-base-300">
                <h3 className="text-lg font-semibold">使い方</h3>
              </div>
              <div className="card-body p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">特徴</h4>
                    <ul className="text-sm space-y-1 text-base-content/70">
                      <li>・Minecraft専用AI翻訳</li>
                      <li>・最大3つの翻訳候補</li>
                      <li>・各候補に信頼度と説明</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">翻訳タイプ</h4>
                    <ul className="text-sm space-y-1 text-base-content/70">
                      <li>・一般翻訳: Minecraftテキスト</li>
                      <li>・アイテム翻訳: アイテム名・説明文</li>
                      <li>・コマンド翻訳: コマンド説明</li>
                      <li>・会話翻訳: NPCや物語の会話</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default MinecraftAITranslator;
