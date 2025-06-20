import React, { useMemo, useEffect, useRef, useCallback } from "react";
import { FixedSizeList, FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { useListStore, useSyncTranslateData } from "./stores/ListStore";
import { useediter } from "./stores/EditerStore";
import { Search } from "./Search";
import ColorCodeText from "./ColorCodeText";

type FilterType = "all" | "translated" | "untranslated";

// テキストを省略する関数
// 指定された最大文字数を超える場合、末尾に"..."を追加して省略表示します
const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

// テキストをハイライトする関数
// 検索クエリに一致する部分をハイライト表示します
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

// 未翻訳アイテムを判定する関数
// 翻訳文が空、または原文と一致する場合は未翻訳とみなします
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

  // アクティブなフィルターの状態を管理
  const [activeFilter, setActiveFilter] = React.useState<FilterType>("all");

  // Zustand ストアから必要なデータを取得
  const translateData = useListStore((state) => state.translate);
  const searchQuery = useListStore((state) => state.searchQuery);
  const replaceQuery = useListStore((state) => state.replaceQuery);
  const listindex = useListStore((state) => state.listindex);
  const replaceItems = useListStore((state) => state.replaceItems);
  const currentReplaceIndex = useListStore((state) => state.currentReplaceIndex);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const listRef = useRef<FixedSizeList<any>>(null);

  // エディターストアのセッター関数を取得
  const setkey = useediter((state) => state.setkey);
  const setsourcevalue = useediter((state) => state.setSourceValue);
  const settargetvalue = useediter((state) => state.setTargetValue);
  const isReplaceMode = useediter((state) => state.isReplaceMode);
  // const indexInReplaceMode = useediter((state) => state.indexInReplaceMode);
  const setIndexInReplaceMode = useediter((state) => state.setIndexInReplaceMode);

  // フィルターと検索クエリに基づいて表示するアイテムを決定
  const filteredItems = useMemo(() => {
    if (!translateData || !translateData.list) return [];

    console.log("フィルター実行", { 
      activeFilter, 
      searchQuery, 
      replaceQuery,
      isReplaceMode,
      totalItems: translateData.list.length 
    });

    let filteredList = translateData.list;

    // 置き換えモード中は置き換え対象のアイテムのみを表示
    if (isReplaceMode && replaceItems.length > 0) {
      return replaceItems;
    }

    // フィルターを適用
    if (activeFilter === "translated") {
      filteredList = filteredList.filter(
        (item) => !isUntranslated(item.sourceValue, item.targetValue),
      );
    } else if (activeFilter === "untranslated") {
      filteredList = filteredList.filter((item) =>
        isUntranslated(item.sourceValue, item.targetValue),
      );
    }

    // 検索クエリを適用
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      return filteredList.filter(
        (item) =>
          (item.key && item.key.toLowerCase().includes(query)) ||
          (item.sourceValue && item.sourceValue.toLowerCase().includes(query)) ||
          (item.targetValue && item.targetValue.toLowerCase().includes(query))
      );
    }

    // 置き換えモード用のフィルタリング
    if (replaceQuery && replaceQuery.trim()) {
      filteredList = filteredList.filter((item) =>
        item.targetValue && item.targetValue.toLowerCase().includes(replaceQuery.toLowerCase())
      );
    }

    return filteredList;
  }, [translateData, searchQuery, replaceQuery, activeFilter, isReplaceMode, replaceItems]);

  // リストアイテム選択時の処理
  const handleItemSelect = useCallback(
    (key: string, sourceValue: string, targetValue: string) => {
      // アイテムの値は常に更新
      setkey(key);
      setsourcevalue(sourceValue);
      settargetvalue(targetValue);
      
      // 置き換えモード中の場合、選択したアイテムに対応するインデックスを更新
      if (isReplaceMode && replaceItems.length > 0) {
        const selectedItemIndex = replaceItems.findIndex(item => item.key === key);
        if (selectedItemIndex !== -1) {
          // 選択したアイテムが置き換え対象リスト内にある場合、現在のインデックスを更新
          const setCurrentIndex = useListStore.getState().setCurrentReplaceIndex;
          setCurrentIndex(selectedItemIndex);
          setIndexInReplaceMode(selectedItemIndex);
        }
      }
    },
    [setkey, setsourcevalue, settargetvalue, isReplaceMode, replaceItems, setIndexInReplaceMode],
  );
  
  // 置き換えモード中のアイテムに戻る
  const returnToReplaceItem = useCallback(() => {
    if (isReplaceMode && replaceItems.length > 0 && currentReplaceIndex < replaceItems.length) {
      const currentItem = replaceItems[currentReplaceIndex];
      setkey(currentItem.key);
      setsourcevalue(currentItem.sourceValue);
      settargetvalue(currentItem.targetValue);
      
      // スクロール位置も更新
      const itemIndex = filteredItems.findIndex(item => item.key === currentItem.key);
      if (itemIndex >= 0 && listRef.current) {
        listRef.current.scrollToItem(itemIndex);
      }
    }
  }, [isReplaceMode, replaceItems, currentReplaceIndex, filteredItems, setkey, setsourcevalue, settargetvalue]);

  // リストのスクロール位置をリセット
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollToItem(listindex);
    }
  }, [listindex]);

  // 翻訳済み項目の数を計算
  const translatedCount = useMemo(() => {
    if (!translateData || !translateData.list) return 0;
    return translateData.list.filter(
      (item) => !isUntranslated(item.sourceValue, item.targetValue),
    ).length;
  }, [translateData]);

  // 未翻訳項目の数を計算
  const untranslatedCount = useMemo(() => {
    if (!translateData || !translateData.list) return 0;
    return translateData.list.filter((item) =>
      isUntranslated(item.sourceValue, item.targetValue),
    ).length;
  }, [translateData]);

  // 総項目数を計算
  const totalCount = useMemo(() => {
    if (!translateData || !translateData.list) return 0;
    return translateData.list.length;
  }, [translateData]);

  // データがない場合のプレースホルダーを表示
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

    // 置き換え処理中のアイテムかどうかを判定
    const isReplaceTargetItem = isReplaceMode && replaceItems.some(
      (replaceItem) => replaceItem.key === item.key
    );

    // 現在処理中の置き換えアイテムかどうかを判定
    const isCurrentReplaceItem = isReplaceMode && 
      replaceItems.length > 0 && 
      currentReplaceIndex < replaceItems.length && 
      replaceItems[currentReplaceIndex]?.key === item.key;

    return (
      <div
        style={style}
        className={`flex flex-col p-3 border-b border-base-300 transition-colors cursor-pointer ${
          isCurrentReplaceItem 
            ? 'bg-base-300' 
            : isReplaceTargetItem 
              ? 'bg-base-200'
              : 'hover:bg-base-200'
        }`}
        onClick={() =>
          handleItemSelect(item.key, item.sourceValue, item.targetValue)
        }
      >
        <>
          {/* キー */}
          <div className="text-sm font-medium text-primary mb-1 truncate flex items-center justify-between">
            <span>
              {searchQuery
                ? highlightText(truncateText(item.key, 50), searchQuery)
                : truncateText(item.key, 50)}
            </span>
            {isCurrentReplaceItem && (
              <span className="badge badge-sm ml-2">
                置換処理中 {currentReplaceIndex + 1}/{replaceItems.length}
              </span>
            )}
            {isReplaceTargetItem && !isCurrentReplaceItem && (
              <span className="badge badge-outline badge-sm ml-2">置換対象</span>
            )}
          </div>

          {/* 翻訳元の値 */}
          <div className="text-sm mb-1 pl-2 truncate">
            <span className="text-xs text-secondary mr-1">元:</span>
            {searchQuery
              ? highlightText(
                  <ColorCodeText text={truncateText(item.sourceValue, 40)} className="inline" />,
                  searchQuery
                )
              : (
                <ColorCodeText text={truncateText(item.sourceValue, 40)} className="inline" />
              )}
          </div>

          {/* 翻訳対象の値 */}
          <div className="text-sm pl-2 truncate">
            <span className="text-xs text-accent mr-1">訳:</span>
            {!isItemUntranslated ? (
              searchQuery ? (
                highlightText(
                  <ColorCodeText text={truncateText(item.targetValue, 40)} className="inline" />,
                  searchQuery
                )
              ) : (
                <ColorCodeText text={truncateText(item.targetValue, 40)} className="inline" />
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
        
        {/* 置き換えモード中の操作バー */}
        {isReplaceMode && replaceItems.length > 0 && (
          <div className="alert shadow-sm bg-accent/10 text-accent-content p-2 mb-2 rounded-md">
            <div className="text-sm text-base-content">
              置き換え処理中: {currentReplaceIndex + 1} / {replaceItems.length}
            </div>
            <button 
              className="btn btn-sm btn-accent"
              onClick={returnToReplaceItem}
            >
              置き換え処理に戻る
            </button>
          </div>
        )}
        
        {/* 検索結果カウント */}
        {searchQuery && (
          <div className="text-xs text-right pr-3 text-info-content">
            検索結果: {filteredItems.length}件
          </div>
        )}

        {/* ドロップダウンメニュー型フィルター */}
        <div className="dropdown mb-2 w-full">
          <div tabIndex={0} role="button" className="btn m-1 w-full justify-between">
            <span>
              {activeFilter === "all" ? "全て" : activeFilter === "translated" ? "翻訳済み" : "未翻訳"}
              <span className="badge badge-sm ml-2">
                {activeFilter === "all" ? totalCount : activeFilter === "translated" ? translatedCount : untranslatedCount}
              </span>
            </span>
            <svg className="fill-current ml-2" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
              <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
            </svg>
          </div>
          <ul tabIndex={0} className="dropdown-content z-[1] menu shadow bg-base-100 rounded-box w-52">
            <li>
              <a onClick={() => setActiveFilter("all")}>
                全て
                <span className="badge badge-sm badge-neutral ml-1">
                  {totalCount}
                </span>
              </a>
            </li>
            <li>
              <a onClick={() => setActiveFilter("translated")}>
                翻訳済み
                <span className="badge badge-sm badge-success ml-1">
                  {translatedCount}
                </span>
              </a>
            </li>
            <li>
              <a onClick={() => setActiveFilter("untranslated")}>
                未翻訳
                <span className="badge badge-sm badge-warning ml-1">
                  {untranslatedCount}
                </span>
              </a>
            </li>
          </ul>
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
