import React, { useMemo, useEffect, useRef, useCallback } from "react";
import { FixedSizeList, FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { useListStore, useSyncTranslateData } from "./stores/ListStore";
import { useediter } from "./stores/EditerStore";
import { Search } from "./Search";

// テキストを省略する関数
const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  //長かった場合...をつける
  return text.substring(0, maxLength) + "...";
};

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

// フィルターのタイプ定義
type FilterType = "all" | "translated" | "untranslated";

// 未翻訳アイテムを判定する関数（原文と翻訳文が一致する場合も未翻訳とみなす）
const isUntranslated = (
  sourceValue: string,
  targetValue: string | undefined,
): boolean => {
  return (
    !targetValue ||
    targetValue.trim() === "" ||
    targetValue.trim() === sourceValue.trim()
  );
};

export default function TranslationList() {
  useSyncTranslateData();

  // アクティブなフィルターの状態
  const [activeFilter, setActiveFilter] = React.useState<FilterType>("all");

  // Zustand ストアから翻訳データを取得
  const translateData = useListStore((state) => state.translate);
  const searchQuery = useListStore((state) => state.searchQuery);
  const listindex = useListStore((state) => state.listindex);
  const listRef = useRef<FixedSizeList<any>>(null);

  // エディターストアのセッター関数を取得
  const setkey = useediter((state) => state.setkey);
  const setsourcevalue = useediter((state) => state.setSourceValue);
  const settargetvalue = useediter((state) => state.setTargetValue);

  // イベントハンドラをuseCallbackで定義
  const handleItemSelect = useCallback(
    (key: string, sourceValue: string, targetValue: string) => {
      setkey(key);
      setsourcevalue(sourceValue);
      settargetvalue(targetValue);
    },
    [setkey, setsourcevalue, settargetvalue],
  );

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollToItem(listindex);
    }
  }, [listindex]);

  // 翻訳済み項目の計算
  const translatedCount = useMemo(() => {
    if (!translateData || !translateData.list) return 0;
    return translateData.list.filter(
      (item) => !isUntranslated(item.sourceValue, item.targetValue),
    ).length;
  }, [translateData]);

  // 未翻訳項目の計算
  const untranslatedCount = useMemo(() => {
    if (!translateData || !translateData.list) return 0;
    return translateData.list.filter((item) =>
      isUntranslated(item.sourceValue, item.targetValue),
    ).length;
  }, [translateData]);

  // 総数の計算
  const totalCount = useMemo(() => {
    if (!translateData || !translateData.list) return 0;
    return translateData.list.length;
  }, [translateData]);

  // 表示するべきアイテム
  const filteredItems = useMemo(() => {
    if (!translateData || !translateData.list) return [];

    // まずフィルターを適用
    let filteredList = translateData.list;

    // フィルターに基づいて項目をフィルタリング
    if (activeFilter === "translated") {
      filteredList = filteredList.filter(
        (item) => !isUntranslated(item.sourceValue, item.targetValue),
      );
    } else if (activeFilter === "untranslated") {
      filteredList = filteredList.filter((item) =>
        isUntranslated(item.sourceValue, item.targetValue),
      );
    }

    // 検索クエリがある場合はさらにフィルタリング
    if (searchQuery.trim()) {
      return filteredList.filter(
        (item) =>
          item.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.sourceValue.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.targetValue?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return filteredList;
  }, [translateData, searchQuery, activeFilter]);

  // データがない場合のプレースホルダー
  if (!translateData || !translateData.list) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="text-lg mb-2 opacity-70">翻訳データがありません</div>
        <p className="text-sm opacity-50">
          右上のメニューから翻訳元ファイルと翻訳対象ファイルを開いてください
        </p>
      </div>
    );
  }

  // リストの行アイテムをレンダリング
  const Row = ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) => {
    const item = filteredItems[index];
    const isItemUntranslated = isUntranslated(
      item.sourceValue,
      item.targetValue,
    );

    return (
      <div
        style={style}
        className={`flex flex-col p-3 border-b border-base-300 hover:bg-base-200 transition-colors cursor-pointer`}
        onClick={(_) =>
          handleItemSelect(item.key, item.sourceValue, item.targetValue)
        }
      >
        <>
          {/* キー */}
          <div className="text-sm font-medium text-primary mb-1 truncate">
            {searchQuery
              ? highlightText(truncateText(item.key, 50), searchQuery)
              : truncateText(item.key, 50)}
          </div>

          {/* 翻訳元の値 */}
          <div className="text-sm mb-1 pl-2 truncate">
            <span className="text-xs text-secondary mr-1">元:</span>
            {searchQuery
              ? highlightText(truncateText(item.sourceValue, 40), searchQuery)
              : truncateText(item.sourceValue, 40)}
          </div>

          {/* 翻訳対象の値 */}
          <div className="text-sm pl-2 truncate">
            <span className="text-xs text-accent mr-1">訳:</span>
            {!isItemUntranslated ? (
              searchQuery ? (
                highlightText(truncateText(item.targetValue, 40), searchQuery)
              ) : (
                truncateText(item.targetValue, 40)
              )
            ) : (
              <span className="italic opacity-50">
                {item.targetValue &&
                item.targetValue.trim() === item.sourceValue.trim()
                  ? "原文と同じ（未翻訳）"
                  : "未翻訳"}
              </span>
            )}
          </div>
        </>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex">
      {/* リストパート */}
      <div className="flex flex-col w-full h-full">
        {/* 検索バー */}
        <Search />
        {/* 検索結果カウント */}
        {searchQuery && (
          <div className="text-xs text-right pr-3 text-info-content">
            検索結果: {filteredItems.length}件
          </div>
        )}

        {/* タブ型フィルター */}
        <div role="tablist" className="tabs tabs-border bg-base-200 mb-2">
          <button
            role="tab"
            className={`tab ${activeFilter === "all" ? "tab-active" : ""} min-w-1/6 `}
            onClick={() => setActiveFilter("all")}
          >
            全て{" "}
            <span className="badge badge-sm badge-neutral ml-1">
              {totalCount}
            </span>
          </button>
          <button
            role="tab"
            className={`tab ${activeFilter === "translated" ? "tab-active" : ""} min-w-1/6`}
            onClick={() => setActiveFilter("translated")}
          >
            翻訳済み{" "}
            <span className="badge badge-sm badge-success ml-1">
              {translatedCount}
            </span>
          </button>
          <button
            role="tab"
            className={`tab ${activeFilter === "untranslated" ? "tab-active" : ""} min-w-1/6 `}
            onClick={() => setActiveFilter("untranslated")}
          >
            未翻訳{" "}
            <span className="badge badge-sm badge-warning ml-1">
              {untranslatedCount}
            </span>
          </button>
        </div>

        {/* リスト */}
        <div
          className="flex-1 rounded-md my-2"
          style={{ height: "calc(100vh - 100px)", width: "100%" }}
        >
          {filteredItems.length > 0 ? (
            <AutoSizer>
              {({ height, width }) => {
                return width > 0 && height > 0 ? (
                  <List
                    ref={listRef}
                    height={height}
                    width={width}
                    itemCount={filteredItems.length}
                    itemSize={90}
                    overscanCount={5}
                  >
                    {Row}
                  </List>
                ) : null;
              }}
            </AutoSizer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="text-lg mb-2 opacity-70">
                {searchQuery ? "検索結果なし" : "表示項目なし"}
              </div>
              <p className="text-sm opacity-50">
                {searchQuery
                  ? "別の検索キーワードを試してください"
                  : "別のフィルターを選択してください"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
