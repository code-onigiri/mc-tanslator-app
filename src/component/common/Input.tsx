// Input.tsx - 共通インプットコンポーネント
import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  color?: "primary" | "secondary" | "accent" | "info" | "success" | "warning" | "error";
  size?: "xs" | "sm" | "md" | "lg";
};

export const Input: React.FC<InputProps> = ({
  label,
  error,
  color = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const base = "input input-bordered";
  const colorClass = color ? `input-${color}` : "";
  const sizeClass = size ? `input-${size}` : "";

  return (
    <div className="form-control w-full">
      {label && (
        <label className="label">
          <span className="label-text">{label}</span>
        </label>
      )}
      <input
        className={`${base} ${colorClass} ${sizeClass} ${className}`}
        {...props}
      />
      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
};

export default Input;