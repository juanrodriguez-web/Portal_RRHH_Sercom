"use client";

import { useState, useMemo } from "react";
import { ComunicadoCard, ComunicadoCardProps } from "./card";
import { FormularioEditarComunicado } from "./formulario-editar";
import { SearchIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";

export type Comunicado = Omit<ComunicadoCardProps, "puedeEditar" | "onEdit" | "size">;

type FilterType = "todos" | "importantes" | "activos";

export function ComunicadosGrid({
  comunicados,
  puedeEditar = false,
}: {
  comunicados: Comunicado[];
  puedeEditar?: boolean;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("todos");

  // Filtrar y buscar
  const filtered = useMemo(() => {
    let result = comunicados;

    // Aplicar filtro
    if (filterType === "importantes") {
      result = result.filter((c) => c.importante);
    } else if (filterType === "activos") {
      result = result.filter((c) => !c.importante);
    }

    // Aplicar búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.titulo.toLowerCase().includes(query) ||
          c.contenido.toLowerCase().includes(query) ||
          c.autor.name.toLowerCase().includes(query)
      );
    }

    return result;
  }, [comunicados, searchQuery, filterType]);

  const destacados = filtered.filter((c) => c.importante);
  const normales = filtered.filter((c) => !c.importante);

  const hasResults = destacados.length > 0 || normales.length > 0;

  return (
    <div className="space-y-6">
      {/* Buscador y Filtros */}
      <div className="space-y-3">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar comunicados..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-3 text-sm placeholder-muted-foreground focus:border-brand focus:outline-none"
          />
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={filterType === "todos" ? "primary" : "secondary"}
            onClick={() => setFilterType("todos")}
          >
            Todos
          </Button>
          <Button
            size="sm"
            variant={filterType === "importantes" ? "primary" : "secondary"}
            onClick={() => setFilterType("importantes")}
          >
            📌 Importantes
          </Button>
          <Button
            size="sm"
            variant={filterType === "activos" ? "primary" : "secondary"}
            onClick={() => setFilterType("activos")}
          >
            Activos
          </Button>
        </div>
      </div>

      {!hasResults ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {searchQuery
            ? "No se encontraron comunicados que coincidan con tu búsqueda."
            : "Sin comunicados."}
        </p>
      ) : (
        <div className="space-y-8">
          {/* Sección Destacados (2 columnas) */}
          {destacados.length > 0 && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
              <h3 className="mb-4 text-sm font-semibold uppercase text-muted-foreground">
                📌 Destacados ({destacados.length})
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
                {destacados.map((c, i) => (
                  <div
                    key={c.id}
                    style={{
                      animation: `fadeInUp 0.5s ease-out ${i * 100}ms both`,
                    }}
                  >
                    <ComunicadoCard
                      {...c}
                      puedeEditar={puedeEditar}
                      onEdit={(id) => setEditingId(id)}
                      size="featured"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sección Normales (3 columnas) */}
          {normales.length > 0 && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
              {destacados.length > 0 && (
                <h3 className="mb-4 text-sm font-semibold uppercase text-muted-foreground">
                  Comunicados ({normales.length})
                </h3>
              )}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {normales.map((c, i) => (
                  <div
                    key={c.id}
                    style={{
                      animation: `fadeInUp 0.5s ease-out ${(i + destacados.length) * 100}ms both`,
                    }}
                  >
                    <ComunicadoCard
                      {...c}
                      puedeEditar={puedeEditar}
                      onEdit={(id) => setEditingId(id)}
                      size="compact"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
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

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
