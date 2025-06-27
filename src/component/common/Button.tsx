// Button.tsx - 共通ボタンコンポーネント
import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  color?: "primary" | "secondary" | "accent" | "neutral" | "info" | "success" | "warning" | "error";
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "solid" | "outline" | "ghost" | "link";
  children: React.ReactNode;
};

export const Button: React.FC<ButtonProps> = ({
  color = "primary",
  size = "md",
  variant = "solid",
  className = "",
  children,
  ...props
}) => {
  const base = "btn";
  const colorClass = `btn-${color}`;
  const sizeClass = size ? `btn-${size}` : "";
  const variantClass =
    variant === "outline"
      ? "btn-outline"
      : variant === "ghost"
      ? "btn-ghost"
      : variant === "link"
      ? "btn-link"
      : "";

  return (
    <button
      className={`${base} ${colorClass} ${sizeClass} ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;