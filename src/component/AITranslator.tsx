import { useState } from "react";
import { useediter } from "./stores/EditerStore";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import ColorCodeText from "./ColorCodeText";
import { GoogleGenerativeAI } from "@google/generative-ai";

function Translator() {
  const sourceValue = useediter((state) => state.sourcevalue);
  const setTargetValue = useediter((state) => state.setTargetValue);

  // 翻訳結果を保持する状態
  const [translationResult, setTranslationResult] = useState("");
  // ローディング状態
  const [isLoading, setIsLoading] = useState(false);
  // 選択された翻訳言語
  const [targetLanguage, setTargetLanguage] = useState("ja");

  // 翻訳実行の処理
  const handleTranslate = async () => {
    if (!sourceValue.trim()) {
      toast.error("翻訳する原文がありません");
      return;
    }

    const apiKey = localStorage.getItem("geminiApiKey");
    if (!apiKey) {
      toast.error(
        "Gemini APIキーが設定されていません。設定メニューから登録してください。"
      );
      return;
    }

    setIsLoading(true);
    setTranslationResult(""); // Clear previous results

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `Translate the following text to ${targetLanguage}: ${sourceValue}`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = await response.text();

      setTranslationResult(text);
      toast.success("翻訳が完了しました！");
    } catch (error) {
      console.error("Error translating with Gemini:", error);
      toast.error("翻訳中にエラーが発生しました。");
    } finally {
      setIsLoading(false);
    }
  };

  // 翻訳結果を適用する
  const applyTranslation = () => {
    if (translationResult) {
      setTargetValue(translationResult);
      toast.success("翻訳結果を適用しました！");
    } else {
      toast.error("適用する翻訳結果がありません");
    }
  };

  return (
    <div className="flex flex-col h-full p-3">
      <h2 className="text-lg font-semibold mb-4">AI翻訳ツール</h2>

      {/* 翻訳設定 */}
      <div className="mb-4 space-y-3">
        <div className="form-control">
          <label className="label">
            <span className="label-text">翻訳先言語</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
          >
            <option value="ja">日本語</option>
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="es">Español</option>
            <option value="de">Deutsch</option>
            <option value="ko">한국어</option>
            <option value="zh-CN">中文 (简体)</option>
            {/* Add more languages as needed */}
          </select>
        </div>
      </div>

      {/* 翻訳実行ボタン */}
      <button
        className={`btn btn-primary w-full ${isLoading ? "loading" : ""}`}
        onClick={handleTranslate}
        disabled={isLoading || !sourceValue}
      >
        {isLoading ? "翻訳中..." : "翻訳実行"}
      </button>

      {/* 翻訳結果表示エリア */}
      {translationResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <h3 className="text-md font-medium mb-2">翻訳結果:</h3>
          <div className="bg-base-200 p-3 rounded-md min-h-[100px] mb-3">
            <ColorCodeText text={translationResult} />
          </div>

          <button className="btn btn-success w-full" onClick={applyTranslation}>
            この翻訳結果を適用
          </button>
        </motion.div>
      )}

      {/* ヒントやガイド */}
      <div className="mt-auto pt-4">
        <div className="bg-base-200/50 p-3 rounded-md text-sm opacity-80">
          <p className="font-medium mb-1">使い方:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>翻訳先言語を選択</li>
            <li>「翻訳実行」をクリック</li>
            <li>結果を確認して「適用」</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default Translator;
