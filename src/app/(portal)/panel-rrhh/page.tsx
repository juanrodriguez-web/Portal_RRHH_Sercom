import { requirePermissionOrRedirect } from "@/lib/authz";
import { PERMISSIONS } from "@/lib/permissions";
import { getKpisRRHH } from "@/lib/dashboard";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Metrica } from "@/components/panel-rrhh/panel-metricas";
import { AccionRapida } from "@/components/panel-rrhh/acciones-rapidas";
import { UsersIcon, CalendarIcon, DownloadIcon, ClockIcon } from "@/components/ui/icons";

export default async function PanelRRHHPage() {
  await requirePermissionOrRedirect(PERMISSIONS.gestionarUsuariosRrhh);
  const kpis = await getKpisRRHH();

  // Actividad reciente: últimas 5 acciones de audit
  const recentActivityRaw = await prisma.auditLog.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { actor: { select: { name: true } } },
  });

  // Para User/UserPermission, entidadId es el id del EMPLEADO AFECTADO (no
  // de la fila de permiso) -- se resuelve en batch para mostrar su nombre
  // en vez del id crudo.
  const empleadoIds = [
    ...new Set(
      recentActivityRaw
        .filter((l) => l.entidad === "User" || l.entidad === "UserPermission")
        .map((l) => l.entidadId)
    ),
  ];
  const empleados = empleadoIds.length
    ? await prisma.user.findMany({ where: { id: { in: empleadoIds } }, select: { id: true, name: true } })
    : [];
  const nombrePorId = new Map(empleados.map((e) => [e.id, e.name]));

  const ACCION_LABEL: Record<string, string> = {
    CREAR_USUARIO: "Dio de alta a",
    ACTUALIZAR_USUARIO: "Actualizó a",
    BORRAR_USUARIO: "Borró a",
    ASIGNAR_GRUPO_PERMISOS: "Cambió el rol de",
  };

  const recentActivity = recentActivityRaw.map((log) => {
    const empleado = nombrePorId.get(log.entidadId);
    const accionLabel = ACCION_LABEL[log.accion];
    const grupoNuevo =
      log.valoresDespues && typeof log.valoresDespues === "object" && "grupoNuevo" in log.valoresDespues
        ? String((log.valoresDespues as { grupoNuevo?: unknown }).grupoNuevo)
        : null;
    const descripcion =
      accionLabel && empleado
        ? `${accionLabel} ${empleado}${grupoNuevo ? ` (${grupoNuevo})` : ""}`
        : log.accion;
    return { ...log, descripcion };
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
            href="/panel-rrhh/fichajes"
            titulo="Consultar fichajes"
            descripcion="Vista global de fichajes de todos los empleados"
            icono={<ClockIcon className="h-6 w-6" />}
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
                      <p className="font-medium text-foreground text-sm">
                        {log.actor?.name ?? "Alguien"} {log.descripcion}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(log.createdAt).toLocaleString("es-ES")}
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
