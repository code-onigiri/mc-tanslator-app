import React, { useMemo, useState, useEffect } from "react";
import { FixedSizeList as List } from "react-window";
import { translateData } from "../util/file/fileop";
import AutoSizer from "react-virtualized-auto-sizer";
import Editer from "./Editer"; // エディターコンポーネントをインポート

// テキストを省略する関数
const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
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

// エディター用の選択アイテムの型定義
interface SelectedItem {
  key: string;
  sourceValue: string;
  targetValue: string;
}

const TranslationList: React.FC = () => {
  // Zustand ストアから翻訳データを取得
  const { translateSource, translateTarget } = translateData();

  // 状態管理
  const [searchQuery, setSearchQuery] = useState("");
  const [listRef, setListRef] = useState<List | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);

  // translateSource のキーを基にリストアイテムを作成
  const allItems = useMemo(() => {
    if (!translateSource) return [];

    return Object.keys(translateSource).map((key) => ({
      key,
      sourceValue: translateSource[key] || "",
      targetValue: translateTarget?.[key] || "",
    }));
  }, [translateSource, translateTarget]);

  // 検索クエリでフィルタリング
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return allItems;

    const query = searchQuery.toLowerCase();
    return allItems.filter(
      (item) =>
        item.key.toLowerCase().includes(query) ||
        item.sourceValue.toLowerCase().includes(query) ||
        item.targetValue.toLowerCase().includes(query),
    );
  }, [allItems, searchQuery]);

  // 検索クエリが変更されたとき、リストをリセット
  useEffect(() => {
    if (listRef) {
      listRef.scrollTo(0);
    }
  }, [searchQuery]);

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
    const item = filteredItems[index];

    // 右クリックハンドラ
    const handleRightClick = (e: React.MouseEvent) => {
      e.preventDefault(); // デフォルトの右クリックメニューを表示しない
      setSelectedItem(item);
      setEditorOpen(true);
    };

    return (
      <div
        style={style}
        className={`flex flex-col p-3 border-b border-base-300 hover:bg-base-200 transition-colors cursor-pointer ${
          selectedItem?.key === item.key && editorOpen ? "bg-base-300" : ""
        }`}
        onContextMenu={handleRightClick} // 右クリックイベント
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

  return (
    <div className="h-full w-full flex">
      {/* リストパート */}
      <div
        className={`flex flex-col ${editorOpen ? "w-1/2" : "w-full"} transition-all duration-300`}
      >
        {/* 検索バー */}
        <div className="p-3 border-b border-base-300 sticky top-0 z-10 bg-base-100">
          <div className="relative">
            <label className="input">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                🔍
              </div>
              <input
                type="text"
                className="w-full pl-6 py-2"
                placeholder="キーや翻訳テキストを検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </label>
            {searchQuery && (
              <button
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setSearchQuery("")}
                aria-label="検索をクリア"
              >
                <span className="text-gray-500 hover:text-gray-700">✕</span>
              </button>
            )}
          </div>
          {filteredItems.length !== allItems.length && (
            <div className="text-xs mt-1 text-info">
              {filteredItems.length} 件見つかりました（全 {allItems.length}{" "}
              件中）
            </div>
          )}
        </div>

        {/* リスト */}
        <div className="flex-1 rounded-md my-2">
          {filteredItems.length > 0 ? (
            <AutoSizer>
              {({ height, width }) => (
                <List
                  ref={(ref) => setListRef(ref)}
                  height={height}
                  width={width}
                  itemCount={filteredItems.length}
                  itemSize={90}
                  overscanCount={5}
                >
                  {Row}
                </List>
              )}
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

      {/* エディターパート */}
      {editorOpen && (
        <div className="w-1/2 h-full border-l border-base-300 p-2">
          <div className="flex justify-between items-center mb-3 px-2">
            <h3 className="font-bold text-primary">エディター</h3>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => setEditorOpen(false)}
              aria-label="エディターを閉じる"
            >
              ✕
            </button>
          </div>

          {selectedItem && (
            <div className="mb-3 px-2">
              <div className="font-medium mb-1 break-all">
                {selectedItem.key}
              </div>
            </div>
          )}

          <div className="h-[calc(100%-80px)]">
            <Editer />
          </div>
        </div>
      )}
    </div>
  );
};

export default TranslationList;
