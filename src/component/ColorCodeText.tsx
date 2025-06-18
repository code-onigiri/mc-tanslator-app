import React from 'react';
import { renderColorCodeToReact } from '../util/colorCode';

interface ColorCodeTextProps {
  text: string;
  className?: string;
}

/**
 * カラーコード付きテキストを表示するコンポーネント
 */
export const ColorCodeText: React.FC<ColorCodeTextProps> = ({ text, className = '' }) => {
  return (
    <span className={className}>
      {renderColorCodeToReact(text)}
    </span>
  );
};

export default ColorCodeText;