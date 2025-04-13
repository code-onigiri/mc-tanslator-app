import React from "react";

// 共通のダイアログ背景オーバーレイコンポーネント
interface DialogOverlayProps {
  children: React.ReactNode;
  onClose: () => void;
}

function DialogOverlay({ children, onClose }: DialogOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={(e) => {
        // 背景クリックでダイアログを閉じる（バブリングを防止）
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {children}
    </div>
  );
}

interface InfoDialogProps {
  title: string;
  message: React.ReactNode;
  okmessage: string;
  onClose: () => void;
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
  isOpen,
}: InfoDialogProps) {
  if (!isOpen) return null;

  return (
    <DialogOverlay onClose={onClose}>
      <div
        className="card bg-base-100 shadow-xl max-w-md w-11/12 mx-4 relative"
        onClick={(e) => e.stopPropagation()} // バブリング防止
      >
        {/* 閉じるボタン */}
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

        <div className="card-body">
          <h2 className="card-title">{title}</h2>
          <div className="py-4">{message}</div>
          <div className="card-actions justify-end mt-4">
            <button
              className="btn btn-primary"
              onClick={() => {
                onClose();
              }}
            >
              {okmessage}
            </button>
          </div>
        </div>
      </div>
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
  if (!isOpen) return null;

  return (
    <DialogOverlay onClose={onClose}>
      <div
        className="card bg-base-100 shadow-xl max-w-md w-11/12 mx-4 relative"
        onClick={(e) => e.stopPropagation()} // バブリング防止
      >
        {/* 閉じるボタン */}
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

        <div className="card-body">
          <h2 className="card-title">{title}</h2>
          <div className="py-4">{message}</div>
          <div className="card-actions justify-end gap-2 mt-4">
            <button
              className="btn btn-outline"
              onClick={() => {
                onCancel();
                onClose();
              }}
            >
              {cancelmessage}
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                onOk();
                onClose();
              }}
            >
              {okmessage}
            </button>
          </div>
        </div>
      </div>
    </DialogOverlay>
  );
}

// 使用例
// const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
// <InfoDialog
//   isOpen={isInfoDialogOpen}
//   onClose={() => setIsInfoDialogOpen(false)}
//   title="情報"
//   message="処理が完了しました"
//   okmessage="OK"
//   okonclick={() => console.log("OK clicked")}
// />
