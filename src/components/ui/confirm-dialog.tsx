"use client";

import { useState } from "react";
import { Button } from "./button";

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => Promise<void> | void;
  onCancel?: () => void;
  variant?: "destructive" | "warning";
  children: React.ReactNode;
}

export function ConfirmDialog({
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  variant = "destructive",
  children,
}: ConfirmDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      setIsOpen(false);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    onCancel?.();
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)}>{children}</div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>

            <div className="mt-6 flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={handleCancel}
                disabled={isLoading}
              >
                {cancelText}
              </Button>
              <Button
                variant={variant}
                onClick={handleConfirm}
                disabled={isLoading}
              >
                {isLoading ? "Procesando..." : confirmText}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
