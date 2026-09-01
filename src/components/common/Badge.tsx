import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "neutral" | "success" | "warning" | "danger" | "info" | "outline";
  size?: "sm" | "md";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  size = "sm",
  className = "",
}) => {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
  };

  const variantStyles = {
    neutral: "bg-neutral-100 text-neutral-800 border-neutral-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold",
    warning: "bg-amber-50 text-amber-800 border-amber-200 font-bold",
    danger: "bg-red-50 text-red-700 border-red-200 font-bold",
    info: "bg-blue-50 text-blue-700 border-blue-200 font-medium",
    outline: "bg-transparent text-neutral-600 border-neutral-300",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border font-sans ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
