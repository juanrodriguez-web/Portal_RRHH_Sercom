"use client";

import { useTransition } from "react";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatFechaCorta } from "@/lib/format";
import { cancelarSolicitud, resolverSolicitud } from "@/app/(portal)/vacaciones/actions";

export type FilaSolicitud = {
  id: string;
  empleado?: string;
  fechaInicio: Date;
  fechaFin: Date;
  dias: number;
  motivo: string;
  estado: "PENDIENTE" | "APROBADA" | "RECHAZADA" | "CANCELADA";
  puedeCancel?: boolean;
};

const ESTADO_TONE: Record<FilaSolicitud["estado"], BadgeTone> = {
  PENDIENTE: "warning",
  APROBADA: "success",
  RECHAZADA: "danger",
  CANCELADA: "neutral",
};

export function SolicitudesTable({
  filas,
  modoAprobacion,
  ambito,
}: {
  filas: FilaSolicitud[];
  modoAprobacion?: boolean;
  ambito?: "equipo" | "global";
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            {filas.some((f) => f.empleado) ? <th className="py-2 pr-4">Empleado</th> : null}
            <th className="py-2 pr-4">Fechas</th>
            <th className="py-2 pr-4">Motivo</th>
            <th className="py-2 pr-4">Días</th>
            <th className="py-2 pr-4">Estado</th>
            <th className="py-2 pr-4" />
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={f.id} className="border-b border-border last:border-0">
              {f.empleado ? <td className="py-2 pr-4">{f.empleado}</td> : null}
              <td className="py-2 pr-4">
                {formatFechaCorta(f.fechaInicio)}–{formatFechaCorta(f.fechaFin)}
              </td>
              <td className="py-2 pr-4">{f.motivo}</td>
              <td className="py-2 pr-4">{f.dias}</td>
              <td className="py-2 pr-4">
                <Badge tone={ESTADO_TONE[f.estado]}>{f.estado.toLowerCase()}</Badge>
              </td>
              <td className="py-2 pr-4">
                {modoAprobacion && f.estado === "PENDIENTE" && ambito ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="success"
                      disabled={pending}
                      onClick={() => startTransition(async () => { await resolverSolicitud(f.id, true, ambito); })}
                    >
                      Aprobar
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={pending}
                      onClick={() => startTransition(async () => { await resolverSolicitud(f.id, false, ambito); })}
                    >
                      Rechazar
                    </Button>
                  </div>
                ) : f.puedeCancel && f.estado === "PENDIENTE" ? (
                  <button
                    className="text-sm font-semibold text-danger hover:underline disabled:opacity-50"
                    disabled={pending}
                    onClick={() => startTransition(async () => { await cancelarSolicitud(f.id); })}
                  >
                    Cancelar
                  </button>
                ) : null}
              </td>
            </tr>
          ))}
          {filas.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-6 text-center text-muted-foreground">
                Sin solicitudes.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
