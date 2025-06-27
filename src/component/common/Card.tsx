// Card.tsx - 共通カードコンポーネント
import React from "react";

type CardProps = {
  title?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export const Card: React.FC<CardProps> = ({
  title,
  actions,
  children,
  className = "",
}) => (
  <div className={`card bg-base-100 shadow-md ${className}`}>
    {title && (
      <div className="card-title px-4 pt-4">{title}</div>
    )}
    <div className="card-body">{children}</div>
    {actions && (
      <div className="card-actions px-4 pb-4">{actions}</div>
    )}
  </div>
);

export default Card;