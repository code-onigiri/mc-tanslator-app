import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

// 言語コードの型を定義
type LanguageCode = "auto" | "en" | "ja" | "zh" | "fr";

function Translator() {
  // 原文と翻訳文の状態
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");

  // 言語選択
  const [sourceLanguage, setSourceLanguage] = useState<LanguageCode>("auto");
  const [targetLanguage, setTargetLanguage] = useState<LanguageCode>("ja");

  // 翻訳中ローディング状態
  const [isTranslating, setIsTranslating] = useState(false);

  // 翻訳実行
  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      toast.error("翻訳する文章を入力してください");
      return;
    }

    setIsTranslating(true);

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: sourceText,
          from: sourceLanguage,
          to: targetLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error("翻訳リクエストに失敗しました");
      }

      // レスポンスをテキストとして取得
      const textResponse: string = await response.text();

      // ここでJSONとしてパースしようとせず、直接テキストを使用
      setTranslatedText(textResponse);

      toast.success("翻訳が完了しました");
    } catch (error: unknown) {
      console.error("Translation error:", error);

      // エラーメッセージを安全に取得
      let errorMessage = "翻訳中にエラーが発生しました";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsTranslating(false);
    }
  };

  // 言語を入れ替える
  const swapLanguages = () => {
    // 自動検出の場合は入れ替えない
    if (sourceLanguage === "auto") {
      toast.error("自動検出は入れ替えできません");
      return;
    }

    const tempLang = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(tempLang);

    // テキストも入れ替え
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  return (
    <div className="flex flex-col h-full p-4">
      <h2 className="text-xl font-bold mb-4">テキスト翻訳</h2>

      {/* 言語選択部分 */}
      <div className="flex items-center justify-between mb-4">
        <select
          className="select select-bordered select-sm w-28"
          value={sourceLanguage}
          onChange={(e) => setSourceLanguage(e.target.value as LanguageCode)}
        >
          <option value="auto">自動検出</option>
          <option value="en">英語</option>
          <option value="ja">日本語</option>
          <option value="zh">中国語</option>
          <option value="fr">フランス語</option>
        </select>

        <button
          className="btn btn-circle btn-sm btn-ghost"
          onClick={swapLanguages}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path
              fillRule="evenodd"
              d="M1 11.5a.5.5 0 0 0 .5.5h11.793l-3.147 3.146a.5.5 0 0 0 .708.708l4-4a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 11H1.5a.5.5 0 0 0-.5.5zm14-7a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H14.5a.5.5 0 0 1 .5.5z"
            />
          </svg>
        </button>

        <select
          className="select select-bordered select-sm w-28"
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value as LanguageCode)}
        >
          <option value="en">英語</option>
          <option value="ja">日本語</option>
          <option value="zh">中国語</option>
          <option value="fr">フランス語</option>
        </select>
      </div>

      {/* 原文入力エリア */}
      <div className="form-control mb-2 flex-1">
        <textarea
          className="textarea textarea-bordered h-full resize-none text-base"
          placeholder="翻訳したいテキストを入力してください..."
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
        />
      </div>

      {/* 翻訳ボタン */}
      <button
        className={`btn btn-primary my-2 ${isTranslating ? "loading" : ""}`}
        onClick={handleTranslate}
        disabled={isTranslating || !sourceText.trim()}
      >
        {isTranslating ? "翻訳中..." : "翻訳"}
      </button>

      {/* 翻訳結果表示エリア */}
      <div className="mb-6 form-control flex-1">
        <textarea
          className="textarea textarea-bordered h-full resize-none bg-base-200 text-base"
          placeholder="翻訳結果がここに表示されます..."
          value={translatedText}
          readOnly
        />
      </div>

      {/* アクションボタンエリア */}
      {translatedText && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end mt-2 space-x-2"
        >
          <button
            className="btn btn-sm btn-outline"
            onClick={() => {
              navigator.clipboard.writeText(translatedText);
              toast.success("翻訳結果をコピーしました");
            }}
          >
            コピー
          </button>
        </motion.div>
      )}
    </div>
  );
}

export default Translator;
