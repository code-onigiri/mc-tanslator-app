import React from 'react';
import { renderColorCodeToReact } from '../util/colorCode';
import { useSettingsStore } from './stores/SettingsStore';

interface ColorCodeTextProps {
  text: string;
  className?: string;
  // 個別に表示モードを指定したい場合（オプション）
  forceDisplayMode?: 'show' | 'hide' | 'plain';
}

/**
 * カラーコード付きテキストを表示するコンポーネント
 */
export const ColorCodeText: React.FC<ColorCodeTextProps> = ({
  text,
  className = '',
  forceDisplayMode
}) => {
  // 設定ストアからカラーコード表示モードを取得
  const colorCodeDisplayMode = useSettingsStore((state) => state.colorCodeDisplayMode);
  
  // 強制指定がある場合はそれを使用、なければ設定値を使用
  const displayMode = forceDisplayMode || colorCodeDisplayMode;
  
  return (
    <span className={className}>
      {renderColorCodeToReact(text, displayMode)}
    </span>
  );
};

export default ColorCodeText;