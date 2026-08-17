import Link from "next/link";
import { requirePermission } from "@/lib/authz";
import { PERMISSIONS } from "@/lib/permissions";
import { getKpisRRHH } from "@/lib/dashboard";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";

export default async function PanelRRHHPage() {
  await requirePermission(PERMISSIONS.verUsuarios);
  const kpis = await getKpisRRHH();

  // Actividad reciente: últimas 5 acciones de audit
  const recentActivity = await prisma.auditLog.findMany({
    take: 5,
    orderBy: { timestamp: "desc" },
    include: { actor: { select: { name: true } } },
  });

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
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Panel RRHH" }]} />

      {/* KPIs Section */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-foreground">Métricas clave</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {tiles.map((t) => (
            <Card key={t.label} className="text-center p-4">
              <p className="text-2xl font-bold text-foreground">{t.valor}</p>
              <p className="mt-2 text-xs text-muted-foreground">{t.label}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions Section */}
      <Card className="p-6">
        <h3 className="mb-4 text-base font-semibold text-foreground">Acciones rápidas</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/panel-rrhh/usuarios">
            <Button variant="secondary" className="w-full justify-start">
              Gestionar usuarios →
            </Button>
          </Link>
          <Link href="/panel-rrhh/jornadas">
            <Button variant="secondary" className="w-full justify-start">
              Gestionar jornadas →
            </Button>
          </Link>
          <a href="/api/fichajes/export">
            <Button variant="secondary" className="w-full justify-start">
              Exportar fichajes (Excel)
            </Button>
          </a>
          <a href="/api/vacaciones/export">
            <Button variant="secondary" className="w-full justify-start">
              Exportar vacaciones (Excel)
            </Button>
          </a>
        </div>
      </Card>

      {/* Recent Activity Section */}
      {recentActivity.length > 0 && (
        <Card className="p-6">
          <h3 className="mb-3 text-base font-semibold text-foreground">Actividad reciente</h3>
          <div className="space-y-2">
            {recentActivity.map((log) => (
              <div key={log.id} className="flex items-start justify-between border-b border-border pb-2 last:border-0">
                <div className="text-sm">
                  <p className="font-medium text-foreground">{log.accion}</p>
                  <p className="text-xs text-muted-foreground">
                    {log.actor?.name} • {new Date(log.timestamp).toLocaleString("es-ES")}
                  </p>
                  {log.motivo && <p className="text-xs text-muted-foreground">{log.motivo}</p>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
