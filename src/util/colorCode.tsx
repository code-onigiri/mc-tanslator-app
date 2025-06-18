import React from 'react';

// Minecraftカラーコードの定義
export const COLOR_CODES = {
  // 色
  '0': { name: 'black', color: '#000000' },
  '1': { name: 'dark_blue', color: '#0000AA' },
  '2': { name: 'dark_green', color: '#00AA00' },
  '3': { name: 'dark_aqua', color: '#00AAAA' },
  '4': { name: 'dark_red', color: '#AA0000' },
  '5': { name: 'dark_purple', color: '#AA00AA' },
  '6': { name: 'gold', color: '#FFAA00' },
  '7': { name: 'gray', color: '#AAAAAA' },
  '8': { name: 'dark_gray', color: '#555555' },
  '9': { name: 'blue', color: '#5555FF' },
  'a': { name: 'green', color: '#55FF55' },
  'b': { name: 'aqua', color: '#55FFFF' },
  'c': { name: 'red', color: '#FF5555' },
  'd': { name: 'light_purple', color: '#FF55FF' },
  'e': { name: 'yellow', color: '#FFFF55' },
  'f': { name: 'white', color: '#FFFFFF' },
  
  // フォーマット
  'l': { name: 'bold', style: 'font-weight: bold;' },
  'm': { name: 'strikethrough', style: 'text-decoration: line-through;' },
  'n': { name: 'underline', style: 'text-decoration: underline;' },
  'o': { name: 'italic', style: 'font-style: italic;' },
  'r': { name: 'reset', reset: true }
};

export interface ParsedColorCode {
  type: 'text' | 'color-code';
  content: string;
  color?: string;
  styles?: string[];
  isReset?: boolean;
}

/**
 * カラーコード付きテキストを解析して配列に変換
 */
export function parseColorCodeText(text: string): ParsedColorCode[] {
  const result: ParsedColorCode[] = [];
  let currentIndex = 0;
  
  while (currentIndex < text.length) {
    const colorCodeMatch = text.substring(currentIndex).match(/^§([0-9a-frlmno])/i);
    
    if (colorCodeMatch) {
      const codeChar = colorCodeMatch[1].toLowerCase();
      const code = COLOR_CODES[codeChar as keyof typeof COLOR_CODES];
      
      if (code) {
        // カラーコード部分
        result.push({
          type: 'color-code',
          content: colorCodeMatch[0],
          color: 'color' in code ? code.color : undefined,
          styles: 'style' in code ? [code.style] : undefined,
          isReset: 'reset' in code
        });
        
        currentIndex += colorCodeMatch[0].length;
      } else {
        // 不正なカラーコード - 通常テキストとして扱う
        const nextColorCode = text.substring(currentIndex + 1).search(/§[0-9a-frlmno]/i);
        const endIndex = nextColorCode === -1 ? text.length : currentIndex + 1 + nextColorCode;
        
        result.push({
          type: 'text',
          content: text.substring(currentIndex, endIndex)
        });
        
        currentIndex = endIndex;
      }
    } else {
      // 通常のテキスト
      const nextColorCode = text.substring(currentIndex).search(/§[0-9a-frlmno]/i);
      const endIndex = nextColorCode === -1 ? text.length : currentIndex + nextColorCode;
      
      result.push({
        type: 'text',
        content: text.substring(currentIndex, endIndex)
      });
      
      currentIndex = endIndex;
    }
  }
  
  return result;
}

/**
 * 解析されたカラーコードをHTMLに変換
 */
export function renderColorCodeToHTML(parsedContent: ParsedColorCode[]): string {
  let html = '';
  let currentColor = '';
  let currentStyles: string[] = [];
  let openSpan = false;
  
  for (const item of parsedContent) {
    if (item.type === 'color-code') {
      // カラーコード自体を背景色付きで表示
      html += `<span style="background-color: rgba(128, 128, 128, 0.3); padding: 1px 3px; border-radius: 3px; font-family: monospace; font-size: 0.9em;">${item.content}</span>`;
      
      if (item.isReset) {
        // リセット
        if (openSpan) {
          html += '</span>';
          openSpan = false;
        }
        currentColor = '';
        currentStyles = [];
      } else {
        // 色やスタイルの適用
        if (item.color) {
          currentColor = item.color;
        }
        if (item.styles) {
          currentStyles = [...currentStyles, ...item.styles];
        }
      }
    } else {
      // テキスト部分
      if (item.content) {
        if (currentColor || currentStyles.length > 0) {
          if (openSpan) {
            html += '</span>';
          }
          const colorStyle = currentColor ? `color: ${currentColor};` : '';
          const otherStyles = currentStyles.join(' ');
          html += `<span style="${colorStyle} ${otherStyles}">${escapeHtml(item.content)}</span>`;
          openSpan = true;
        } else {
          if (openSpan) {
            html += '</span>';
            openSpan = false;
          }
          html += escapeHtml(item.content);
        }
      }
    }
  }
  
  if (openSpan) {
    html += '</span>';
  }
  
  return html;
}

/**
 * HTMLエスケープ
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * React用のカラーコードレンダリング関数（TailwindCSS + DaisyUI対応）
 */
export function renderColorCodeToReact(text: string): React.ReactNode {
  const parsedContent = parseColorCodeText(text);
  const elements: React.ReactNode[] = [];
  let currentColor = '';
  let currentStyles: string[] = [];
  let key = 0;
  
  for (const item of parsedContent) {
    if (item.type === 'color-code') {
      // カラーコード自体をDaisyUIクラスで表示
      elements.push(
        <span
          key={`code-${key++}`}
          className="bg-base-300 text-base-content px-1 py-0.5 rounded text-xs font-mono"
        >
          {item.content}
        </span>
      );
      
      if (item.isReset) {
        // リセット
        currentColor = '';
        currentStyles = [];
      } else {
        // 色やスタイルの適用
        if (item.color) {
          currentColor = item.color;
        }
        if (item.styles) {
          currentStyles = [...currentStyles, ...item.styles];
        }
      }
    } else {
      // テキスト部分
      if (item.content) {
        if (currentColor || currentStyles.length > 0) {
          const styles: React.CSSProperties = {};
          let className = '';
          
          if (currentColor) {
            styles.color = currentColor;
          }
          
          // スタイルをTailwindCSSクラスに変換
          currentStyles.forEach(style => {
            if (style.includes('font-weight: bold')) className += ' font-bold';
            if (style.includes('text-decoration: line-through')) className += ' line-through';
            if (style.includes('text-decoration: underline')) className += ' underline';
            if (style.includes('font-style: italic')) className += ' italic';
          });
          
          elements.push(
            <span key={`text-${key++}`} style={styles} className={className.trim()}>
              {item.content}
            </span>
          );
        } else {
          elements.push(
            <span key={`text-${key++}`}>
              {item.content}
            </span>
          );
        }
      }
    }
  }
  
  return <>{elements}</>;
}