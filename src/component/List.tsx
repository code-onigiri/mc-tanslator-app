import React, { useMemo, useEffect, useRef, useCallback } from "react";
import { FixedSizeList, FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { useListStore, useSyncTranslateData } from "./stores/ListStore";
import { useediter } from "./stores/EditerStore";

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

export default function TranslationList() {
  useSyncTranslateData();

  // Zustand ストアから翻訳データを取得
  const translateSource = useListStore((state) => state.translateSource);
  const translateTarget = useListStore((state) => state.translateTarget);
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

  // 表示するべきアイテム
  const allItems = useMemo(() => {
    if (!translateSource) return [];

    return Object.keys(translateSource).map((key) => ({
      key,
      sourceValue: translateSource?.[key] || "",
      targetValue: translateTarget?.[key] || "",
    }));
  }, [translateSource, translateTarget]);

  // データがない場合のプレースホルダー
  if (!translateSource) {
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
    const item = allItems[index];

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
            {item.targetValue ? (
              searchQuery ? (
                highlightText(truncateText(item.targetValue, 40), searchQuery)
              ) : (
                truncateText(item.targetValue, 40)
              )
            ) : (
              <span className="italic opacity-50">未翻訳</span>
            )}
          </div>
        </>
      </div>
    );
  };

  console.log("debug:" + allItems.length);

  return (
    <div className="h-full w-full flex">
      {/* リストパート */}
      <div className="flex flex-col w-full h-full">
        {/* リスト */}
        <div
          className="flex-1 rounded-md my-2"
          style={{ height: "calc(100vh - 100px)", width: "100%" }}
        >
          {allItems.length > 0 ? (
            <AutoSizer>
              {({ height, width }) => {
                return width > 0 && height > 0 ? (
                  <List
                    ref={listRef}
                    height={height}
                    width={width}
                    itemCount={allItems.length}
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
              <div className="text-lg mb-2 opacity-70">検索結果なし</div>
              <p className="text-sm opacity-50">
                別の検索キーワードを試してください
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
