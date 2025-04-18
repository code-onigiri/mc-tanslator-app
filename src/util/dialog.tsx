import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// 共通のダイアログ背景オーバーレイコンポーネント
interface DialogOverlayProps {
  children: React.ReactNode;
  onClose: () => void;
  isOpen: boolean;
}

function DialogOverlay({ children, onClose, isOpen }: DialogOverlayProps) {
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
      // ダイアログが開いたときにフォーカスをダイアログに移動
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
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

// 閉じるボタンを共通コンポーネント化
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

// 共通のダイアログカードコンポーネント
interface DialogCardProps {
  children: React.ReactNode;
  onClose: () => void;
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

interface InfoDialogProps {
  title: string;
  message: React.ReactNode;
  okmessage: string;
  onClose: () => void;
  onOk?: () => void; // オプショナルにして、指定がなければonCloseと同じ処理を実行
  isOpen: boolean;
}

interface CheckDialogProps {
  title: string;
  message: React.ReactNode;
  cancelmessage: string;
  okmessage: string;
  onCancel: () => void;
  onOk: () => void;
  onClose: () => void;
  isOpen: boolean;
}

export function InfoDialog({
  title,
  message,
  okmessage,
  onClose,
  onOk,
  isOpen,
}: InfoDialogProps) {
  const handleOk = () => {
    if (onOk) onOk();
    onClose();
  };

  return (
    <DialogOverlay onClose={onClose} isOpen={isOpen}>
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

export function CheckDialog({
  title,
  message,
  cancelmessage,
  okmessage,
  onCancel,
  onOk,
  onClose,
  isOpen,
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
    <DialogOverlay onClose={onClose} isOpen={isOpen}>
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
