"use client";

import { useEffect, useState } from "react";
import { obtenerEstructuraOrganizacional, type OrgChartUser } from "@/app/(portal)/panel-rrhh/actions";
import { OrgChartNode } from "./org-chart-node";

export function OrgChart() {
  const [usuarios, setUsuarios] = useState<OrgChartUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargarOrganigrama() {
      try {
        setLoading(true);
        const datos = await obtenerEstructuraOrganizacional();
        setUsuarios(datos);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error cargando organigrama");
      } finally {
        setLoading(false);
      }
    }

    cargarOrganigrama();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Cargando organigrama...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-danger/50 bg-danger-tint p-4 text-danger">
        <p className="text-sm font-semibold">Error al cargar organigrama</p>
        <p className="text-xs">{error}</p>
      </div>
    );
  }

  if (usuarios.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">No hay estructura organizacional configurada</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto py-8">
      <div className="flex flex-col items-center gap-12 min-w-max px-8">
        {usuarios.map((usuario) => (
          <div key={usuario.id}>
            <OrgChartNode user={usuario} level={0} />
          </div>
        ))}
      </div>
    </div>
  );
}
