"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import parse from "html-react-parser";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatFecha } from "@/lib/format";
import { StarIcon } from "@/components/ui/icons";
import type { ComunicadoCardProps } from "./card";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function VerComunicado({
  comunicado,
  onClose,
}: {
  comunicado: Omit<ComunicadoCardProps, "puedeEditar" | "onEdit" | "size">;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // El elemento que tenía el foco antes de abrir el modal (para devolvérselo al cerrar).
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;

      const focusables = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      previouslyFocused?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <Card
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ver-comunicado-titulo"
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto p-0"
        onClick={(e) => e.stopPropagation()}
      >
        {comunicado.imagen && (
          <div className="relative h-56 w-full overflow-hidden">
            <Image
              src={comunicado.imagen}
              alt={comunicado.titulo}
              fill
              className="object-cover"
              sizes="700px"
            />
          </div>
        )}

        <div className="p-6">
          {comunicado.importante && (
            <div className="mb-3">
              <Badge tone="warning">
                <StarIcon className="h-3 w-3" />
                Importante
              </Badge>
            </div>
          )}

          <h2 id="ver-comunicado-titulo" className="text-xl font-bold text-foreground">
            {comunicado.titulo}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {comunicado.autor.name} · {formatFecha(comunicado.createdAt)}
          </p>

          <div className="prose prose-sm mt-4 max-w-none text-foreground">
            {parse(comunicado.contenido)}
          </div>

          <div className="mt-6 flex justify-end">
            <Button ref={closeBtnRef} variant="secondary" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
