import React, { useMemo, useState, useRef, useCallback } from "react";
import { FixedSizeList, FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { useGlossaryStore } from "./stores/GlossaryStore";

// テキストを省略する関数
const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  // 長かった場合...をつける
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

export default function Glossary() {
  const { glossary, setGlossary } = useGlossaryStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const listRef = useRef<FixedSizeList<any>>(null);

  // 用語の追加・更新
  const addGlossaryItem = useCallback(() => {
    if (newKey.trim() && newValue.trim()) {
      if (editIndex !== null) {
        // 編集モード
        const updatedGlossary = [...glossary];
        updatedGlossary[editIndex] = { key: newKey, value: newValue };
        setGlossary(updatedGlossary);
        setEditIndex(null);
      } else {
        // 新規追加モード
        setGlossary([...glossary, { key: newKey, value: newValue }]);
      }
      setNewKey("");
      setNewValue("");
    }
  }, [newKey, newValue, editIndex, glossary, setGlossary]);

  // 用語の削除
  const deleteGlossaryItem = useCallback(
    (index: number) => {
      const updatedGlossary = [...glossary];
      updatedGlossary.splice(index, 1);
      setGlossary(updatedGlossary);
    },
    [glossary, setGlossary],
  );

  // 編集モードの開始
  const startEdit = useCallback(
    (index: number) => {
      setEditIndex(index);
      setNewKey(glossary[index].key);
      setNewValue(glossary[index].value);
    },
    [glossary],
  );

  // フィルタリングされた用語集
  const filteredItems = useMemo(() => {
    if (searchQuery.trim()) {
      return glossary.filter(
        (item) =>
          item.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.value.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    return glossary;
  }, [glossary, searchQuery]);

  // リストの行アイテムをレンダリング
  const Row = ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) => {
    const item = filteredItems[index];
    const originalIndex = glossary.findIndex(
      (g) => g.key === item.key && g.value === item.value,
    );

    return (
      <div
        style={style}
        className="flex flex-col p-3 border-b border-base-300 hover:bg-base-200 transition-colors"
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {/* キー */}
            <div className="text-sm font-medium text-primary mb-1 truncate">
              {searchQuery
                ? highlightText(truncateText(item.key, 50), searchQuery)
                : truncateText(item.key, 50)}
            </div>

            {/* 訳語の値 */}
            <div className="text-sm pl-2 truncate">
              <span className="text-xs text-accent mr-1">訳:</span>
              {searchQuery
                ? highlightText(truncateText(item.value, 40), searchQuery)
                : truncateText(item.value, 40)}
            </div>
          </div>

          {/* 操作ボタン */}
          <div className="flex space-x-2">
            <button
              className="btn btn-xs btn-outline"
              onClick={() => startEdit(originalIndex)}
            >
              編集
            </button>
            <button
              className="btn btn-xs btn-error btn-outline"
              onClick={() => deleteGlossaryItem(originalIndex)}
            >
              削除
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex">
      <div className="flex flex-col w-full h-full">
        {/* 検索バー */}
        <div className="join w-full mb-2">
          <label className="m-2 input" style={{ width: "100%" }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </label>
        </div>
        {/* 統計情報 */}
        <div className="flex justify-between px-3 py-1 bg-base-200 mb-2 text-sm">
          <span>
            登録用語数:{" "}
            <span className="badge badge-sm badge-neutral">
              {glossary.length}
            </span>
          </span>
          {searchQuery && (
            <span className="text-xs text-right pr-3 text-info-content items-center justify-end">
              検索結果: {filteredItems.length}件
            </span>
          )}
        </div>

        {/* 用語リスト */}
        <div
          className="flex-1 rounded-md my-2"
          style={{ height: "calc(100vh - 220px)", width: "100%" }}
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
                    itemSize={70}
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
                {searchQuery ? "検索結果なし" : "用語集が空です"}
              </div>
              <p className="text-sm opacity-50">
                {searchQuery
                  ? "別の検索キーワードを試してください"
                  : "下部のフォームから用語を追加してください"}
              </p>
            </div>
          )}
        </div>
        {/* 新規追加/編集フォーム */}
        <div className="bg-base-200 p-3 mb-3 rounded-md">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="原語"
                className="input input-bordered input-sm w-full"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
              />
              <input
                type="text"
                placeholder="訳語"
                className="input input-bordered input-sm w-full"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <button
                className="btn btn-primary btn-sm w-full"
                onClick={addGlossaryItem}
              >
                {editIndex !== null ? "更新" : "追加"}
              </button>
              {editIndex !== null && (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    setEditIndex(null);
                    setNewKey("");
                    setNewValue("");
                  }}
                >
                  キャンセル
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
