import React from "react";

/**
 * テキスト内のクエリに一致する部分をハイライト表示する共通関数
 * @param text 対象テキスト
 * @param query ハイライトする文字列
 */
export function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className="bg-warning text-warning-content">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}