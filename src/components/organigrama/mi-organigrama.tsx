"use client";

import { useState } from "react";
import { obtenerNivelSuperior, type OrgNode } from "@/app/(portal)/organigrama/actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronUpIcon } from "@/components/ui/icons";

type PersonaBasica = Pick<OrgNode, "id" | "name" | "email" | "departamento">;

type HierarchyNode = PersonaBasica & Pick<OrgNode, "managerId"> & {
  reportes?: OrgNode["reportes"];
};

function PersonCard({
  nodo,
  destacado,
  compact = false,
}: {
  nodo: PersonaBasica;
  destacado?: boolean;
  compact?: boolean;
}) {
  return (
    <Card
      className={`w-full p-3 ${compact ? "" : "max-w-sm p-4"} border-2 ${
        destacado ? "border-brand bg-brand-tint" : "border-border bg-surface"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex items-center justify-center rounded-full bg-brand font-bold text-white flex-shrink-0 ${
            compact ? "h-8 w-8 text-xs" : "h-10 w-10"
          }`}
        >
          {nodo.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className={`font-semibold text-foreground truncate ${compact ? "text-sm" : ""}`}>{nodo.name}</h3>
          <p className="text-xs text-muted-foreground truncate">{nodo.email}</p>
          {nodo.departamento && <p className="text-xs text-muted-foreground">{nodo.departamento}</p>}
        </div>
      </div>
      {destacado && (
        <div className="mt-2 border-t border-border-strong pt-2">
          <span className="text-xs font-semibold text-brand">TÚ</span>
        </div>
      )}
    </Card>
  );
}

export function MiOrganigrama({ inicial }: { inicial: OrgNode }) {
  const jerarquiaInicial: HierarchyNode[] = inicial.manager
    ? [{ ...inicial.manager }, inicial]
    : [inicial];

  const [jerarquia, setJerarquia] = useState<HierarchyNode[]>(jerarquiaInicial);
  const [loading, setLoading] = useState(false);

  const yo = jerarquia[jerarquia.length - 1];
  const equipo = yo.reportes ?? [];
  const cima = jerarquia[0];
  const hayMasNiveles = Boolean(cima.managerId);

  const expandirArriba = async () => {
    if (loading || !cima.managerId) return;

    setLoading(true);
    try {
      const nivelSuperior = await obtenerNivelSuperior(cima.id);
      if (nivelSuperior) {
        setJerarquia([nivelSuperior, ...jerarquia]);
      }
    } catch (err) {
      console.error("Error expandiendo organigrama:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Botón expandir arriba */}
      {hayMasNiveles && (
        <div className="flex justify-center">
          <Button onClick={expandirArriba} disabled={loading} variant="secondary" size="sm" className="gap-2">
            <ChevronUpIcon className="h-4 w-4" />
            {loading ? "Cargando..." : "Ver más niveles"}
          </Button>
        </div>
      )}

      {/* Cadena de mando: de arriba a abajo */}
      <div className="flex flex-col items-center">
        {jerarquia.map((nodo, idx) => (
          <div key={nodo.id} className="flex flex-col items-center">
            {idx > 0 && <div className="h-6 w-px bg-border" />}
            <PersonCard nodo={nodo} destacado={idx === jerarquia.length - 1} />
          </div>
        ))}
      </div>

      {/* Mi equipo */}
      {equipo.length > 0 ? (
        <div className="flex flex-col items-center">
          <div className="h-6 w-px bg-border" />
          <h4 className="mb-4 text-center text-sm font-semibold uppercase text-muted-foreground">
            Mi equipo ({equipo.length})
          </h4>

          <div className="w-full overflow-x-auto pb-2">
            <div className="mx-auto flex w-fit flex-nowrap gap-6 px-2">
              {equipo.map((reportado, i) => (
                <div key={reportado.id} className="flex w-56 flex-shrink-0 flex-col items-center">
                  {/* Zona conectora: bus horizontal + bajante vertical */}
                  <div className="relative h-6 w-full">
                    <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-border" />
                    {i > 0 && <div className="absolute -left-3 right-1/2 top-0 h-px bg-border" />}
                    {i < equipo.length - 1 && (
                      <div className="absolute left-1/2 -right-3 top-0 h-px bg-border" />
                    )}
                  </div>
                  <PersonCard nodo={reportado} compact />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-sm text-muted-foreground">No tienes equipo asignado</div>
      )}
    </div>
  );
}
