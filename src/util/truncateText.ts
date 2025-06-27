/**
 * 指定された最大文字数を超える場合、末尾に"..."を追加して省略表示する共通関数
 * @param text 対象テキスト
 * @param maxLength 最大文字数（デフォルト: 50）
 */
export function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}