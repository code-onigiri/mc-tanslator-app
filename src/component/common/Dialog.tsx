// Dialog.tsx - 共通ダイアログコンポーネント
import React from "react";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
};

export const Dialog: React.FC<DialogProps> = ({
  open,
  onClose,
  title,
  children,
  actions,
  className = "",
}) => {
  if (!open) return null;
  return (
    <div className="modal modal-open">
      <div className={`modal-box ${className}`}>
        {title && <h3 className="font-bold text-lg mb-2">{title}</h3>}
        <div className="mb-4">{children}</div>
        {actions && <div className="modal-action">{actions}</div>}
        <button className="btn btn-sm btn-circle absolute right-2 top-2" onClick={onClose}>✕</button>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
};

export default Dialog;