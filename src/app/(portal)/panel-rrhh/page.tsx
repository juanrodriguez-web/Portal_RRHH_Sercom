import Link from "next/link";
import { requirePermission } from "@/lib/authz";
import { PERMISSIONS } from "@/lib/permissions";
import { getKpisRRHH } from "@/lib/dashboard";
import { Card } from "@/components/ui/card";

export default async function PanelRRHHPage() {
  await requirePermission(PERMISSIONS.verUsuarios);
  const kpis = await getKpisRRHH();

  const tiles = [
    { label: "Empleados activos", valor: kpis.empleadosActivos },
    { label: "En jornada ahora", valor: kpis.enJornada },
    { label: "Finalizados hoy", valor: kpis.finalizados },
    { label: "Incompletos hoy", valor: kpis.incompletos },
    { label: "Solicitudes pendientes", valor: kpis.solicitudesPendientes },
    { label: "Ausencias próx. 7 días", valor: kpis.ausenciasProximas },
    { label: "Sin jornada asignada", valor: kpis.sinJornada },
    { label: "Sin manager", valor: kpis.sinManager },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {tiles.map((t) => (
          <Card key={t.label} className="text-center">
            <p className="text-3xl font-bold text-foreground">{t.valor}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t.label}</p>
          </Card>
        ))}
      </div>

      <div className="flex gap-4 flex-wrap">
        <Link
          href="/panel-rrhh/usuarios"
          className="rounded-[var(--radius-control)] border border-border-strong bg-surface px-4 py-2 text-sm font-semibold hover:bg-background"
        >
          Gestionar usuarios →
        </Link>
        <Link
          href="/panel-rrhh/jornadas"
          className="rounded-[var(--radius-control)] border border-border-strong bg-surface px-4 py-2 text-sm font-semibold hover:bg-background"
        >
          Gestionar jornadas →
        </Link>
        <a
          href="/api/fichajes/export"
          className="rounded-[var(--radius-control)] border border-border-strong bg-surface px-4 py-2 text-sm font-semibold hover:bg-background"
        >
          Exportar fichajes (Excel)
        </a>
        <a
          href="/api/vacaciones/export"
          className="rounded-[var(--radius-control)] border border-border-strong bg-surface px-4 py-2 text-sm font-semibold hover:bg-background"
        >
          Exportar vacaciones (Excel)
        </a>
      </div>
    </div>
  );
}
