"use client";

import { useState } from "react";
import { obtenerMiOrganigrama, obtenerNivelSuperior, type OrgNode } from "@/app/(portal)/organigrama/actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronUpIcon } from "@/components/ui/icons";

type HierarchyNode = OrgNode & { expanded?: boolean };

export function MiOrganigrama({ inicial }: { inicial: OrgNode }) {
  const [jerarquia, setJerarquia] = useState<HierarchyNode[]>([inicial]);
  const [loading, setLoading] = useState(false);

  const expandirArriba = async () => {
    if (loading || jerarquia.length === 0) return;

    setLoading(true);
    try {
      const primerUsuario = jerarquia[0];
      if (!primerUsuario.manager) {
        setLoading(false);
        return;
      }

      const nivelSuperior = await obtenerNivelSuperior(primerUsuario.id);
      if (nivelSuperior) {
        setJerarquia([nivelSuperior, ...jerarquia]);
      }
    } catch (err) {
      console.error("Error expandiendo organigrama:", err);
    } finally {
      setLoading(false);
    }
  };

  const usuarioActual = jerarquia[jerarquia.length - 1];
  const tieneManagerPendiente = usuarioActual?.manager?.id || false;

  return (
    <div className="space-y-8">
      {/* Botón expandir arriba */}
      {tieneManagerPendiente && (
        <div className="flex justify-center">
          <Button
            onClick={expandirArriba}
            disabled={loading}
            variant="secondary"
            size="sm"
            className="gap-2"
          >
            <ChevronUpIcon className="h-4 w-4" />
            {loading ? "Cargando..." : "Ver más niveles"}
          </Button>
        </div>
      )}

      {/* Jerarquía de arriba a abajo */}
      <div className="space-y-6">
        {jerarquia.map((nodo, idx) => (
          <div key={nodo.id} className="space-y-4">
            {/* Línea vertical */}
            {idx < jerarquia.length - 1 && (
              <div className="flex justify-center">
                <div className="h-8 w-0.5 bg-border" />
              </div>
            )}

            {/* Card del usuario */}
            <div className="flex justify-center">
              <Card
                className={`w-full max-w-sm border-2 p-4 ${
                  idx === jerarquia.length - 1
                    ? "border-brand bg-brand-tint" // YO - destacado
                    : "border-border bg-surface"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white font-bold flex-shrink-0">
                      {nodo.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{nodo.name}</h3>
                      <p className="text-xs text-muted-foreground">{nodo.email}</p>
                      {nodo.departamento && (
                        <p className="text-xs text-muted-foreground mt-1">{nodo.departamento}</p>
                      )}
                    </div>
                  </div>
                  {idx === jerarquia.length - 1 && (
                    <div className="pt-2 border-t border-border-strong">
                      <span className="text-xs font-semibold text-brand">TÚ</span>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Mi equipo (solo en la última fila - yo) */}
            {idx === jerarquia.length - 1 && nodo.reportes.length > 0 && (
              <>
                <div className="flex justify-center">
                  <div className="h-8 w-0.5 bg-border" />
                </div>

                <div className="space-y-4">
                  <h4 className="text-center text-sm font-semibold text-muted-foreground uppercase">
                    Mi equipo ({nodo.reportes.length})
                  </h4>

                  {/* Línea horizontal conectando equipo */}
                  <div className="flex justify-center">
                    <div className="h-0.5 bg-border" style={{ width: `${Math.min(nodo.reportes.length * 220, 600)}px` }} />
                  </div>

                  {/* Cards del equipo */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {nodo.reportes.map((reportado) => (
                      <Card key={reportado.id} className="border-border p-3">
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-strong text-foreground text-xs font-bold flex-shrink-0">
                              {reportado.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">{reportado.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{reportado.email}</p>
                              {reportado.departamento && (
                                <p className="text-xs text-muted-foreground">{reportado.departamento}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Sin equipo */}
      {usuarioActual && usuarioActual.reportes.length === 0 && jerarquia.length > 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No tienes equipo asignado
        </div>
      )}
    </div>
  );
}
