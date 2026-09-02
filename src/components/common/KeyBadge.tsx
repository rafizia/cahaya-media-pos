import React from "react";

interface KeyBadgeProps {
  shortcut: string;
  variant?: "dark" | "light" | "blue" | "ghost";
  className?: string;
}

export const KeyBadge: React.FC<KeyBadgeProps> = ({
  shortcut,
  variant = "dark",
  className = "",
}) => {
  const variantStyles = {
    dark: "bg-neutral-800 text-neutral-200 border-neutral-700",
    light: "bg-neutral-100 text-neutral-700 border-neutral-300",
    blue: "bg-blue-900/60 text-blue-200 border-blue-700",
    ghost: "bg-transparent text-neutral-400 border-neutral-700",
  };

  return (
    <kbd
      className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono font-bold tracking-tight rounded border select-none shadow-[0_1px_0_1px_rgba(0,0,0,0.2)] ${variantStyles[variant]} ${className}`}
    >
      {shortcut}
    </kbd>
  );
};
