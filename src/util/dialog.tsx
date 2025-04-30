import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ダイアログの共通コンポーネント
// モーダルダイアログの背景オーバーレイ
interface DialogOverlayProps {
  children: React.ReactNode; // ダイアログの内容
  onClose: () => void; // ダイアログを閉じる関数
  isOpen: boolean; // ダイアログの表示状態
  showBackground?: boolean; // 背景を表示するかどうか（デフォルトは表示）
}

function DialogOverlay({
  children,
  onClose,
  isOpen,
  showBackground = true, // デフォルトで背景を表示
}: DialogOverlayProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // ESCキーでダイアログを閉じる
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [isOpen, onClose]);

  // フォーカストラップの実装
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      const focusableElements = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }

      // スクロール防止
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`fixed inset-0 z-50 flex items-center justify-center ${
            showBackground ? "bg-black/50" : ""
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
          role="dialog"
          aria-modal="true"
          ref={dialogRef}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// 閉じるボタンの共通コンポーネント
const CloseButton = ({ onClose }: { onClose: () => void }) => (
  <button
    onClick={onClose}
    className="btn btn-sm btn-circle absolute right-2 top-2"
    aria-label="閉じる"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      className="bi bi-x"
      viewBox="0 0 16 16"
    >
      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
    </svg>
  </button>
);

// ダイアログカードの共通コンポーネント
interface DialogCardProps {
  children: React.ReactNode; // ダイアログの内容
  onClose: () => void; // ダイアログを閉じる関数
}

const DialogCard = ({ children, onClose }: DialogCardProps) => (
  <motion.div
    className="card bg-base-100 shadow-xl max-w-md w-11/12 mx-4 relative"
    onClick={(e) => e.stopPropagation()} // バブリング防止
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    transition={{
      type: "spring",
      damping: 25,
      stiffness: 300,
      duration: 0.2,
    }}
  >
    <CloseButton onClose={onClose} />
    {children}
  </motion.div>
);

// 情報ダイアログのコンポーネント
interface InfoDialogProps {
  title: string; // ダイアログのタイトル
  message: React.ReactNode; // ダイアログのメッセージ
  okmessage: string; // OKボタンのラベル
  onClose: () => void; // ダイアログを閉じる関数
  onOk?: () => void; // OKボタンのクリック時の処理
  isOpen: boolean; // ダイアログの表示状態
  showBackground?: boolean; // 背景を表示するかどうか
}

export function InfoDialog({
  title,
  message,
  okmessage,
  onClose,
  onOk,
  isOpen,
  showBackground = true,
}: InfoDialogProps) {
  const handleOk = () => {
    if (onOk) onOk();
    onClose();
  };

  return (
    <DialogOverlay
      onClose={onClose}
      isOpen={isOpen}
      showBackground={showBackground}
    >
      <DialogCard onClose={onClose}>
        <div className="card-body">
          <h2 className="card-title">{title}</h2>
          <div className="py-4">{message}</div>
          <div className="card-actions justify-end mt-4">
            <motion.button
              className="btn btn-primary"
              onClick={handleOk}
              autoFocus
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {okmessage}
            </motion.button>
          </div>
        </div>
      </DialogCard>
    </DialogOverlay>
  );
}

// 確認ダイアログのコンポーネント
interface CheckDialogProps {
  title: string; // ダイアログのタイトル
  message: React.ReactNode; // ダイアログのメッセージ
  cancelmessage: string; // キャンセルボタンのラベル
  okmessage: string; // OKボタンのラベル
  onCancel: () => void; // キャンセルボタンのクリック時の処理
  onOk: () => void; // OKボタンのクリック時の処理
  onClose: () => void; // ダイアログを閉じる関数
  isOpen: boolean; // ダイアログの表示状態
  showBackground?: boolean; // 背景を表示するかどうか
}

export function CheckDialog({
  title,
  message,
  cancelmessage,
  okmessage,
  onCancel,
  onOk,
  onClose,
  isOpen,
  showBackground = true,
}: CheckDialogProps) {
  const handleCancel = () => {
    onCancel();
    onClose();
  };

  const handleOk = () => {
    onOk();
    onClose();
  };

  return (
    <DialogOverlay
      onClose={onClose}
      isOpen={isOpen}
      showBackground={showBackground}
    >
      <DialogCard onClose={onClose}>
        <div className="card-body">
          <h2 className="card-title">{title}</h2>
          <div className="py-4">{message}</div>
          <div className="card-actions justify-end gap-2 mt-4">
            <motion.button
              className="btn btn-outline"
              onClick={handleCancel}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {cancelmessage}
            </motion.button>
            <motion.button
              className="btn btn-primary"
              onClick={handleOk}
              autoFocus
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {okmessage}
            </motion.button>
          </div>
        </div>
      </DialogCard>
    </DialogOverlay>
  );
}
