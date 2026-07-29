import type { ReactNode } from "react";

export type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info" | "brand";

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-border text-muted-foreground",
  success: "bg-success-tint text-success",
  warning: "bg-warning-tint-strong text-warning",
  danger: "bg-danger-tint-strong text-danger",
  info: "bg-info-tint-strong text-info",
  brand: "bg-brand-tint-strong text-brand",
};

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
