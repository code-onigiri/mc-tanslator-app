import { useediter } from "./stores/EditerStore";
import { translateData } from "../util/file/fileop";
import Glossary from "./Glossary";
import { useGlossaryStore } from "./stores/GlossaryStore";
import { useMemo } from "react";

// テキストをハイライトする関数
const highlightText = (text: string, query: string): React.ReactNode => {
  if (!query.trim()) return <>{text}</>;

  const parts = text.split(new RegExp(`(${query})`, "gi"));

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className="bg-yellow-200 text-black">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
};

export default function Editer() {
  // EditerStoreからのステート取得
  const key = useediter((state) => state.key);
  const sourceValue = useediter((state) => state.sourcevalue);
  const targetValue = useediter((state) => state.targetvalue);
  const setTargetValue = useediter((state) => state.setTargetValue);

  // fileop ストアからデータと更新関数を取得
  const fileTargetValue = translateData((state) => state.translateTarget);
  const setFileTargetValue = translateData((state) => state.settranslateTarget);

  // 用語集の取得
  const glossary = useGlossaryStore((state) => state.glossary);

  // 原文・訳文に含まれる用語をフィルタリング
  const relevantGlossaryEntries = useMemo(() => {
    if ((!sourceValue && !targetValue) || !glossary.length) return [];

    return glossary.filter((entry) => {
      // 用語の前後が空白文字（またはテキストの先頭/末尾）かチェックする関数
      const isWholeWord = (text: string, word: string) => {
        const wordRegex = new RegExp(
          `(^|\\s)${word.toLowerCase()}($|\\s)`,
          "i",
        );
        return wordRegex.test(text.toLowerCase());
      };

      return (
        (sourceValue && isWholeWord(sourceValue, entry.key)) ||
        (targetValue && isWholeWord(targetValue, entry.key))
      );
    });
  }, [sourceValue, targetValue, glossary]);

  // ユーザーが textarea を編集した時のハンドラ
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newTargetValue = e.target.value;

    // EditerStore 内の値を更新
    setTargetValue(newTargetValue);

    // 翻訳データが存在する場合、翻訳データストアも同時に更新
    if (fileTargetValue && key !== "none") {
      const updatedTargets = { ...fileTargetValue };
      updatedTargets[key] = newTargetValue;
      setFileTargetValue(updatedTargets);
    }
  };

  // key が "none" の場合は何も表示しない
  if (key === "none") {
    return null;
  }

  return (
    <div className="flex flex-row bg-base-100 h-full">
      <div className="w-2/3 rounded-sm p-2 flex flex-col">
        <div className="text-primary text-lg">
          key:
          <span className="text-primary text-lg rounded-md px-3 py-1 bg-base-200 w-full h-fit">
            {key}
          </span>
        </div>
        <div className="mt-4 text-lg">原文:</div>
        <div className="text-lg rounded-md p-4 bg-base-200 w-full h-fit">
          {sourceValue}
        </div>
        <div className="mt-4 text-lg">翻訳文:</div>
        <textarea
          className="text-lg rounded-md p-4 bg-base-200 w-full h-fit mb-4"
          value={targetValue}
          onChange={handleChange}
        />

        {/* 関連する用語集を表示 */}
        {relevantGlossaryEntries.length > 0 && (
          <div className="mt-2 p-4 bg-base-200 rounded-md">
            <h3 className="text-md font-semibold mb-3">
              テキストに含まれる用語 ({relevantGlossaryEntries.length}件)
            </h3>
            <div className="max-h-60 overflow-y-auto">
              {relevantGlossaryEntries.map((item, index) => (
                <div
                  key={index}
                  className="mb-3 p-3 bg-base-100 rounded-md shadow-sm"
                >
                  <div className="font-medium text-primary">
                    {highlightText(item.key, item.key)}
                  </div>
                  <div className="mt-1 pl-2 text-sm">
                    <span className="text-xs text-accent mr-1">訳:</span>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="w-1/3 border-l border-base-300">
        <Glossary />
      </div>
    </div>
  );
}
