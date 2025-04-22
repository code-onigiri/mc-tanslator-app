import { useState } from "react";
import { useediter } from "./stores/EditerStore";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

function Translator() {
  const sourceValue = useediter((state) => state.sourcevalue);
  const setTargetValue = useediter((state) => state.setTargetValue);

  // 翻訳結果を保持する状態
  const [translationResult, setTranslationResult] = useState("");
  // ローディング状態
  const [isLoading, setIsLoading] = useState(false);
  // 選択された翻訳言語
  const [targetLanguage, setTargetLanguage] = useState("ja");
  // 翻訳モデル
  const [model, setModel] = useState("gpt-3.5");

  // 翻訳実行の処理（モック）
  const handleTranslate = () => {
    if (!sourceValue.trim()) {
      toast.error("翻訳する原文がありません");
      return;
    }

    setIsLoading(true);

    // APIコール処理の代わりにタイマーを使ったモック
    setTimeout(() => {
      // モック翻訳結果
      let mockResult = "";
      if (targetLanguage === "ja") {
        mockResult =
          "これはモックの翻訳結果です。実際のAPIが実装されたら、本物の翻訳が表示されます。";
      } else if (targetLanguage === "en") {
        mockResult =
          "This is a mock translation result. When the actual API is implemented, a real translation will be displayed.";
      } else {
        mockResult =
          "Ceci est un résultat de traduction simulé. Lorsque l'API réelle sera implémentée, une vraie traduction sera affichée.";
      }

      setTranslationResult(mockResult);
      setIsLoading(false);
      toast.success("翻訳が完了しました！");
    }, 1500);
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
            <option value="en">英語</option>
            <option value="fr">フランス語</option>
          </select>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">翻訳モデル</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="gpt-3.5">GPT-3.5</option>
            <option value="gpt-4">GPT-4</option>
            <option value="custom">カスタムモデル</option>
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
            {translationResult}
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
            <li>翻訳先言語とモデルを選択</li>
            <li>「翻訳実行」をクリック</li>
            <li>結果を確認して「適用」</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default Translator;
