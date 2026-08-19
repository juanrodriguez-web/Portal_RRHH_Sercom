import { requirePermission } from "@/lib/authz";
import { PERMISSIONS } from "@/lib/permissions";
import { getKpisRRHH } from "@/lib/dashboard";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Metrica } from "@/components/panel-rrhh/panel-metricas";
import { AccionRapida } from "@/components/panel-rrhh/acciones-rapidas";
import { UsersIcon, CalendarIcon, DownloadIcon } from "@/components/ui/icons";

export default async function PanelRRHHPage() {
  await requirePermission(PERMISSIONS.gestionarUsuariosRrhh);
  const kpis = await getKpisRRHH();

  // Actividad reciente: últimas 5 acciones de audit
  const recentActivity = await prisma.auditLog.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { actor: { select: { name: true } } },
  });

  return (
    <div className="space-y-8">
      <Breadcrumb items={[{ label: "Panel RRHH" }]} />

      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Panel de Control RRHH</h1>
        <p className="text-muted-foreground mt-2">Gestiona usuarios, fichajes, vacaciones y más desde aquí</p>
      </div>

      {/* KPIs Section - Grid mejorado */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Métricas clave</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Metrica valor={kpis.empleadosActivos} etiqueta="Empleados activos" icono="👥" color="brand" />
          <Metrica valor={kpis.enJornada} etiqueta="En jornada ahora" icono="⏱️" color="success" />
          <Metrica valor={kpis.finalizados} etiqueta="Finalizados hoy" icono="✓" color="info" />
          <Metrica valor={kpis.incompletos} etiqueta="Incompletos hoy" icono="⏳" color="warning" />
          <Metrica valor={kpis.solicitudesPendientes} etiqueta="Solicitudes pendientes" icono="📋" color="danger" />
          <Metrica valor={kpis.ausenciasProximas} etiqueta="Ausencias próx. 7 días" icono="📅" color="info" />
          <Metrica valor={kpis.sinJornada} etiqueta="Sin jornada asignada" icono="⚠️" color="warning" />
          <Metrica valor={kpis.sinManager} etiqueta="Sin manager asignado" icono="🔗" color="warning" />
        </div>
      </div>

      {/* Acciones Rápidas - Rediseño */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Acciones rápidas</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AccionRapida
            href="/panel-rrhh/usuarios"
            titulo="Gestionar usuarios"
            descripcion="Edita atributos RRHH y permisos de empleados"
            icono={<UsersIcon className="h-6 w-6" />}
            color="primary"
          />
          <AccionRapida
            href="/panel-rrhh/jornadas"
            titulo="Gestionar jornadas"
            descripcion="Configura plantillas de horarios de trabajo"
            icono={<CalendarIcon className="h-6 w-6" />}
            color="secondary"
          />
          <AccionRapida
            href="/api/fichajes/export"
            titulo="Exportar fichajes"
            descripcion="Descarga reportes de fichajes en Excel"
            icono={<DownloadIcon className="h-6 w-6" />}
            color="tertiary"
          />
          <AccionRapida
            href="/api/vacaciones/export"
            titulo="Exportar vacaciones"
            descripcion="Descarga reportes de solicitudes de vacaciones"
            icono={<DownloadIcon className="h-6 w-6" />}
            color="tertiary"
          />
        </div>
      </div>

      {/* Actividad Reciente */}
      {recentActivity.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Actividad reciente</h2>
          <Card className="overflow-hidden">
            <div className="divide-y divide-border">
              {recentActivity.map((log) => (
                <div key={log.id} className="p-4 hover:bg-muted transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-foreground text-sm">{log.accion}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {log.actor?.name} • {new Date(log.createdAt).toLocaleString("es-ES")}
                      </p>
                      {log.motivo && <p className="text-xs text-muted-foreground mt-0.5">{log.motivo}</p>}
                    </div>
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded text-muted-foreground">
                      {log.entidad}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
