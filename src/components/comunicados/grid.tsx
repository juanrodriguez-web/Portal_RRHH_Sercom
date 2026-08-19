"use client";

import { useState } from "react";
import { ComunicadoCard, ComunicadoCardProps } from "./card";
import { FormularioEditarComunicado } from "./formulario-editar";

export type Comunicado = Omit<ComunicadoCardProps, "puedeEditar" | "onEdit" | "size">;

export function ComunicadosGrid({
  comunicados,
  puedeEditar = false,
}: {
  comunicados: Comunicado[];
  puedeEditar?: boolean;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (comunicados.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin comunicados.</p>;
  }

  // Separar destacados y normales
  const destacados = comunicados.filter((c) => c.importante);
  const normales = comunicados.filter((c) => !c.importante);

  return (
    <div className="space-y-8">
      {/* Sección Destacados (2 columnas) */}
      {destacados.length > 0 && (
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase text-muted-foreground">
            📌 Destacados
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
            {destacados.map((c) => (
              <ComunicadoCard
                key={c.id}
                {...c}
                puedeEditar={puedeEditar}
                onEdit={(id) => setEditingId(id)}
                size="featured"
              />
            ))}
          </div>
        </div>
      )}

      {/* Sección Normales (3 columnas) */}
      {normales.length > 0 && (
        <div>
          {destacados.length > 0 && (
            <h3 className="mb-4 text-sm font-semibold uppercase text-muted-foreground">
              Comunicados
            </h3>
          )}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {normales.map((c) => (
              <ComunicadoCard
                key={c.id}
                {...c}
                puedeEditar={puedeEditar}
                onEdit={(id) => setEditingId(id)}
                size="compact"
              />
            ))}
          </div>
        </div>
      )}

      {/* Modal de Edición */}
      {editingId && puedeEditar && (
        <FormularioEditarComunicado
          id={editingId}
          comunicado={comunicados.find((c) => c.id === editingId)}
          onClose={() => setEditingId(null)}
        />
      )}
    </div>
  );
}
