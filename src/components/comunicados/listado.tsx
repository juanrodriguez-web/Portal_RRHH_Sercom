"use client";

import { useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatFechaCorta } from "@/lib/format";
import { archivarComunicado, marcarImportante } from "@/app/(portal)/comunicados/actions";

export type Comunicado = {
  id: string;
  titulo: string;
  contenido: string;
  importante: boolean;
  createdAt: Date;
  autor: { name: string };
};

export function ListadoComunicados({
  comunicados,
  puedeEditar,
}: {
  comunicados: Comunicado[];
  puedeEditar: boolean;
}) {
  const [pending, startTransition] = useTransition();

  if (comunicados.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin comunicados.</p>;
  }

  return (
    <div className="space-y-4">
      {comunicados.map((c) => (
        <div key={c.id} className="rounded-[var(--radius-control)] border border-border bg-surface p-4">
          <div className="mb-2 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-foreground">{c.titulo}</h3>
                {c.importante ? (
                  <Badge tone="warning" className="text-xs">
                    Importante
                  </Badge>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">
                {c.autor.name} · {formatFechaCorta(c.createdAt)}
              </p>
            </div>
          </div>

          <p className="mb-3 whitespace-pre-wrap text-sm text-foreground">{c.contenido}</p>

          {puedeEditar ? (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await marcarImportante(c.id, !c.importante);
                  })
                }
              >
                {c.importante ? "Desmarcar importante" : "Marcar importante"}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await archivarComunicado(c.id);
                  })
                }
              >
                Archivar
              </Button>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
