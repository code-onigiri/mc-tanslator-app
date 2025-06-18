import React from 'react';
import { COLOR_CODES } from '../util/colorCode';

interface ColorCodeToolbarProps {
  onInsertCode: (code: string) => void;
  className?: string;
}

/**
 * カラーコード入力補助ツールバー
 */
export const ColorCodeToolbar: React.FC<ColorCodeToolbarProps> = ({ 
  onInsertCode, 
  className = '' 
}) => {
  const colorCodes = Object.entries(COLOR_CODES).filter(([, def]) => 'color' in def);
  const formatCodes = Object.entries(COLOR_CODES).filter(([, def]) => 'style' in def || 'reset' in def);

  return (
    <div className={`p-3 bg-base-200 rounded-box ${className}`}>
      <div className="text-sm font-medium mb-2 text-base-content">カラーコード挿入</div>
      
      {/* 色コード */}
      <div className="mb-3">
        <div className="text-xs text-base-content/70 mb-2">色:</div>
        <div className="grid grid-cols-8 gap-1">
          {colorCodes.map(([code, def]) => (
            <button
              key={code}
              className="btn btn-xs h-8 w-8 p-0 border border-base-300 hover:border-base-content"
              style={{
                backgroundColor: 'color' in def ? def.color : '#000',
                color: ['0', '1', '2', '4', '5', '8'].includes(code) ? '#fff' : '#000'
              }}
              onClick={() => onInsertCode(`§${code}`)}
              title={`§${code} - ${'color' in def ? def.color : ''}`}
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      {/* フォーマットコード */}
      <div>
        <div className="text-xs text-base-content/70 mb-2">フォーマット:</div>
        <div className="flex flex-wrap gap-1">
          {formatCodes.map(([code, def]) => (
            <button
              key={code}
              className="btn btn-xs btn-outline"
              onClick={() => onInsertCode(`§${code}`)}
              title={`§${code} - ${def.name}`}
            >
              {code === 'l' && <strong>B</strong>}
              {code === 'm' && <del>S</del>}
              {code === 'n' && <u>U</u>}
              {code === 'o' && <em>I</em>}
              {code === 'r' && 'R'}
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-base-content/70 mt-2">
        クリックして翻訳文にカラーコードを挿入
      </div>
    </div>
  );
};

export default ColorCodeToolbar;