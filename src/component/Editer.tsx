import { useMemo, useState } from "react";
import { useediter } from "./stores/EditerStore";
import { translateData } from "../util/file/fileop";
import Glossary from "./Glossary";
import AITranslator from "./AITranslator";
import Translator from "./Translator";
import { useGlossaryStore } from "./stores/GlossaryStore";
import { useListStore } from "./stores/ListStore";
import toast from "react-hot-toast";
import { eventBus, REPLACE_EVENTS } from "../util/eventBus";

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
  // タブの状態管理
  const [activeTab, setActiveTab] = useState<
    "glossary" | "translator" | "ai-translator"
  >("glossary");

  // 置き換え用の状態
  const searchQuery = useListStore((state) => state.searchQuery);
  const replaceQuery = useListStore((state) => state.replaceQuery);

  // EditerStoreからのステート取得
  const key = useediter((state) => state.key);
  const sourceValue = useediter((state) => state.sourcevalue);
  const targetValue = useediter((state) => state.targetvalue);
  const setTargetValue = useediter((state) => state.setTargetValue);
  const isReplaceMode = useediter((state) => state.isReplaceMode);

  // fileop ストアからデータと更新関数を取得
  const fileTargetValue = translateData((state) => state.translateTarget);
  const setFileTargetValue = translateData((state) => state.settranslateTarget);

  // 用語集の取得
  const glossary = useGlossaryStore((state) => state.glossary);
  const setGlossary = useGlossaryStore((state) => state.setGlossary);

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

  // 現在の原文と翻訳文をそのまま用語集に追加する関数
  const addCurrentTextToGlossary = () => {
    if (sourceValue && targetValue) {
      // 既存の項目と重複チェック
      const existingItem = glossary.findIndex(
        (item) => item.key === sourceValue,
      );

      if (existingItem >= 0) {
        // 既存のアイテムがある場合は更新
        const updatedGlossary = [...glossary];
        updatedGlossary[existingItem] = {
          key: sourceValue,
          value: targetValue,
        };
        setGlossary(updatedGlossary);
        toast.success("用語集を更新しました！");
      } else {
        // 新規追加
        setGlossary([...glossary, { key: sourceValue, value: targetValue }]);
        toast.success("用語集に追加しました！");
      }
    } else {
      toast.error("原文と翻訳文の両方が必要です");
    }
  };

  // ユーザーが textarea を編集した時のハンドラ
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newTargetValue = e.target.value;

    // EditerStore 内の値を更新
    setTargetValue(newTargetValue);

    // 翻訳データが存在する場合、翻訳データストアも同時に更新
    if (fileTargetValue && key !== "none" && !isReplaceMode) {
      const updatedTargets = { ...fileTargetValue };
      updatedTargets[key] = newTargetValue;
      setFileTargetValue(updatedTargets);
    }
  };

  // 置換モードを終了する関数
  const cancelReplaceMode = () => {
    // イベントバスを通してキャンセルを通知
    eventBus.emit(REPLACE_EVENTS.CANCEL_REPLACE_MODE);
  };

  // 現在のアイテムを置換する関数
  const replaceCurrentItem = () => {
    // イベントバスを通して置換を通知
    eventBus.emit(REPLACE_EVENTS.REPLACE_CURRENT);
  };

  // 置換をスキップする関数
  const skipCurrentReplace = () => {
    // イベントバスを通してスキップを通知
    eventBus.emit(REPLACE_EVENTS.SKIP_CURRENT);
  };

  // タブの内容をレンダリングする関数
  const renderTabContent = () => {
    switch (activeTab) {
      case "glossary":
        return <Glossary />;
      case "translator":
        return <Translator />;
      case "ai-translator":
        return <AITranslator />;
      default:
        return <Glossary />;
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
        
        {isReplaceMode ? (
          // 置換モード時は差分表示
          <div className="flex flex-col gap-2">
            {/* 元のテキスト - 赤色ハイライト */}
            <div className="text-lg rounded-md p-4 bg-red-50 border border-red-200 w-full h-fit">
              <div dangerouslySetInnerHTML={{ 
                __html: targetValue.replace(
                  new RegExp(searchQuery, 'gi'), 
                  (match) => `<span class="bg-red-200 text-red-900">${match}</span>`
                )
              }} />
            </div>
            
            {/* 置換後のテキスト - 緑色ハイライト */}
            <div className="text-lg rounded-md p-4 bg-green-50 border border-green-200 w-full h-fit">
              <div dangerouslySetInnerHTML={{ 
                __html: targetValue.replace(
                  new RegExp(searchQuery, 'gi'), 
                  () => `<span class="bg-green-200 text-green-900">${replaceQuery}</span>`
                )
              }} />
            </div>
            
            {/* 置換操作ボタン */}
            <div className="flex justify-end gap-2 my-2">
              <button 
                className="btn btn-error btn-sm" 
                onClick={cancelReplaceMode}
              >
                キャンセル
              </button>
              <button 
                className="btn btn-warning btn-sm"
                onClick={skipCurrentReplace}
              >
                スキップ
              </button>
              <button 
                className="btn btn-success btn-sm"
                onClick={replaceCurrentItem}
              >
                置き換え
              </button>
            </div>
          </div>
        ) : (
          // 通常モードは編集可能なテキストエリア
          <textarea
            className="text-lg rounded-md p-4 bg-base-200 w-full h-fit mb-4"
            value={targetValue}
            onChange={handleChange}
          />
        )}

        {/* 置換モード以外では用語集追加ボタンを表示 */}
        {!isReplaceMode && (
          <div className="mb-4">
            <button
              className="btn btn-primary w-full"
              onClick={addCurrentTextToGlossary}
              disabled={!sourceValue || !targetValue}
            >
              この原文と翻訳文を用語集に登録
            </button>
          </div>
        )}

        {/* 関連する用語集を表示 */}
        {relevantGlossaryEntries.length > 0 && !isReplaceMode && (
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
      <div className="w-1/3 border-l border-base-300 flex flex-col">
        {/* タブ切り替え部分 */}
        <div className="tabs tabs-boxed bg-base-200 mb-2 mx-2 mt-2">
          <a
            className={`tab ${activeTab === "glossary" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("glossary")}
          >
            用語集
          </a>
          <a
            className={`tab ${activeTab === "translator" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("translator")}
          >
            翻訳機能
          </a>
          <a
            className={`tab ${activeTab === "ai-translator" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("ai-translator")}
          >
            AI翻訳
          </a>
        </div>

        {/* タブに応じたコンポーネントを表示 */}
        <div className="flex-1 overflow-hidden">{renderTabContent()}</div>
      </div>
    </div>
  );
}
