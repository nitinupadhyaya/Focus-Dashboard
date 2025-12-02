import * as React from "react";

type Variant = "default" | "outline" | "destructive" | "secondary" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  className?: string;
}

export function Button({
  variant = "default",
  className = "",
  ...props
}: ButtonProps) {
  const base = "px-4 py-2 rounded-lg font-medium transition focus:outline-none focus:ring";

  const variantStyles: Record<Variant, string> = {
    default: "bg-green-500 text-white hover:bg-green-600",
    outline: "border border-gray-400 text-gray-700 hover:bg-gray-100",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    secondary: "bg-indigo-600 text-white hover:bg-indigo-700",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
  };

  const styles = variantStyles[variant] ?? variantStyles.default;

  return <button className={`${base} ${styles} ${className}`} {...props} />;
}

