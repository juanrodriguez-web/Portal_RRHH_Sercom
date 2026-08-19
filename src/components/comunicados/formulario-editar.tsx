"use client";

import { useTransition, useState } from "react";
import Image from "next/image";
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
  const [imagen, setImagen] = useState<string | null>(comunicado?.imagen || null);
  const [error, setError] = useState<string | null>(null);

  if (!comunicado) return null;

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("La imagen no debe exceder 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagen(event.target?.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  }

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
                formData.get("importante") === "on",
                imagen
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

          {/* Imagen */}
          <div>
            <label className="text-sm font-medium">Imagen</label>
            {imagen ? (
              <div className="relative mt-2 h-40 w-full overflow-hidden rounded border border-border">
                <Image src={imagen} alt="preview" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => setImagen(null)}
                  className="absolute right-2 top-2 rounded bg-danger px-2 py-1 text-xs font-semibold text-white"
                >
                  Quitar
                </button>
              </div>
            ) : (
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1 w-full rounded border border-border bg-background p-2 text-sm"
                disabled={pending}
              />
            )}
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

          {error && <p className="text-sm text-danger">{error}</p>}

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
