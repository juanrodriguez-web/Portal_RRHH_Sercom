import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "success" | "warning" | "destructive";
type Size = "sm" | "md";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-hover focus:ring-2 focus:ring-brand focus:ring-offset-2 disabled:bg-border-strong disabled:text-muted-foreground",
  secondary:
    "bg-surface border border-border-strong text-foreground hover:bg-background focus:ring-2 focus:ring-brand focus:ring-offset-2 disabled:opacity-50",
  ghost: "text-foreground hover:bg-background focus:ring-2 focus:ring-brand focus:ring-offset-2 disabled:opacity-50",
  success: "bg-success text-white hover:brightness-110 focus:ring-2 focus:ring-success focus:ring-offset-2 disabled:bg-border-strong disabled:text-muted-foreground",
  warning: "bg-orange-500 text-white hover:bg-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:bg-border-strong disabled:text-muted-foreground",
  destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-600 focus:ring-offset-2 disabled:bg-border-strong disabled:text-muted-foreground",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] font-semibold transition-colors disabled:cursor-not-allowed outline-none ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    />
  );
}
