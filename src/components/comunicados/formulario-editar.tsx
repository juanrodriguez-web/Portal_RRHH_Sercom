"use client";

import { useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { editarComunicado } from "@/app/(portal)/comunicados/actions";
import type { ComunicadoCardProps } from "./card";

export function FormularioEditarComunicado({
  id,
  comunicado,
  onClose,
}: {
  id: string;
  comunicado?: Omit<ComunicadoCardProps, "puedeEditar" | "onEdit" | "size">;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();

  if (!comunicado) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-2xl space-y-4 p-6">
        <h2 className="text-lg font-bold">Editar Comunicado</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            startTransition(async () => {
              const result = await editarComunicado(
                id,
                formData.get("titulo") as string,
                formData.get("contenido") as string,
                formData.get("importante") === "on"
              );
              if (result.ok) {
                onClose();
              }
            });
          }}
          className="space-y-4"
        >
          <div>
            <label className="text-sm font-medium">Título</label>
            <input
              type="text"
              name="titulo"
              defaultValue={comunicado.titulo}
              maxLength={200}
              className="mt-1 w-full rounded border border-border bg-background p-2 text-sm"
              disabled={pending}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Contenido</label>
            <textarea
              name="contenido"
              defaultValue={comunicado.contenido.replace(/<[^>]*>/g, "")}
              rows={6}
              className="mt-1 w-full rounded border border-border bg-background p-2 text-sm"
              disabled={pending}
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="importante"
              defaultChecked={comunicado.importante}
              className="rounded"
              disabled={pending}
            />
            <span className="text-sm font-medium">Marcar como importante</span>
          </label>

          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>
              Guardar cambios
            </Button>
            <Button type="button" variant="secondary" onClick={onClose} disabled={pending}>
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
