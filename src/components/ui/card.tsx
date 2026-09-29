import { forwardRef, type HTMLAttributes } from "react";

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function Card({ className = "", ...props }, ref) {
    return (
      <div
        ref={ref}
        className={`rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-sm ${className}`}
        {...props}
      />
    );
  }
);
