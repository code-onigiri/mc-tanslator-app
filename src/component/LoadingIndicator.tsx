import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingIndicatorProps {
  isLoading: boolean;
  message?: string;
  progress?: number;
  onCancel?: () => void;
  showProgress?: boolean;
  estimatedTime?: number;
}

export default function LoadingIndicator({
  isLoading,
  message = "処理中...",
  progress = 0,
  onCancel,
  showProgress = false,
  estimatedTime
}: LoadingIndicatorProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [dots, setDots] = useState('');

  // 経過時間の計測
  useEffect(() => {
    if (!isLoading) {
      setElapsedTime(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoading]);

  // ドットアニメーション
  useEffect(() => {
    if (!isLoading) {
      setDots('');
      return;
    }

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isLoading]);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}秒`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}分${remainingSeconds}秒`;
  };

  const getEstimatedRemaining = (): string | null => {
    if (!estimatedTime || !showProgress || progress === 0) return null;
    
    const remaining = Math.round((estimatedTime * (100 - progress)) / 100);
    return remaining > 0 ? formatTime(remaining) : null;
  };

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-base-100 p-6 rounded-lg shadow-xl max-w-sm w-full mx-4"
          >
            {/* ローディングスピナー */}
            <div className="flex items-center justify-center mb-4">
              <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>

            {/* メッセージ */}
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold mb-2">
                {message}{dots}
              </h3>
              
              {/* 経過時間 */}
              <p className="text-sm text-base-content/70">
                経過時間: {formatTime(elapsedTime)}
              </p>
              
              {/* 推定残り時間 */}
              {getEstimatedRemaining() && (
                <p className="text-sm text-base-content/70">
                  推定残り時間: {getEstimatedRemaining()}
                </p>
              )}
            </div>

            {/* プログレスバー */}
            {showProgress && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>進行状況</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-base-300 rounded-full h-2">
                  <motion.div
                    className="bg-primary h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            {/* キャンセルボタン */}
            {onCancel && (
              <div className="flex justify-center">
                <button
                  onClick={onCancel}
                  className="btn btn-outline btn-sm"
                >
                  キャンセル
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// 翻訳専用のローディングコンポーネント
interface TranslationLoadingProps {
  isLoading: boolean;
  onCancel?: () => void;
  model?: string;
}

export function TranslationLoading({ 
  isLoading, 
  onCancel, 
  model = 'Gemini' 
}: TranslationLoadingProps) {
  const [stage, setStage] = useState(0);

  const stages = [
    'テキストを解析中',
    `${model}に送信中`,
    '翻訳を生成中',
    '結果を処理中'
  ];

  useEffect(() => {
    if (!isLoading) {
      setStage(0);
      return;
    }

    const interval = setInterval(() => {
      setStage(prev => (prev + 1) % stages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isLoading, stages.length]);

  return (
    <LoadingIndicator
      isLoading={isLoading}
      message={stages[stage]}
      onCancel={onCancel}
      estimatedTime={15}
    />
  );
}

// シンプルなインライン・ローディング
interface InlineLoadingProps {
  isLoading: boolean;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function InlineLoading({ 
  isLoading, 
  message = "読み込み中...", 
  size = 'md' 
}: InlineLoadingProps) {
  const sizeClasses = {
    sm: 'loading-sm',
    md: 'loading-md',
    lg: 'loading-lg'
  };

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex items-center justify-center p-4 text-center"
        >
          <div className={`loading loading-spinner ${sizeClasses[size]} mr-2`}></div>
          <span className="text-base-content/70">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}