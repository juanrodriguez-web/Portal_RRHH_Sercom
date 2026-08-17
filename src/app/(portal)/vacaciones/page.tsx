import { requireUser, getUserPermissionCodes, getEquipoIds } from "@/lib/authz";
import { PERMISSIONS } from "@/lib/permissions";
import { getResumenSaldo } from "@/lib/vacaciones";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SaldoCard } from "@/components/vacaciones/saldo-card";
import { SolicitarForm } from "@/components/vacaciones/solicitar-form";
import { SolicitudesTable, type FilaSolicitud } from "@/components/vacaciones/solicitudes-table";

export default async function VacacionesPage() {
  const user = await requireUser();
  const permisos = await getUserPermissionCodes(user.id);
  const anio = new Date().getUTCFullYear();

  const resumen = await getResumenSaldo(user.id, anio);

  const misSolicitudes = await prisma.solicitudAusencia.findMany({
    where: { userId: user.id, tipoAusenciaCodigo: "VACACIONES" },
    orderBy: { createdAt: "desc" },
  });

  const filasMias: FilaSolicitud[] = misSolicitudes.map((s) => ({
    id: s.id,
    fechaInicio: s.fechaInicio,
    fechaFin: s.fechaFin,
    dias: s.dias,
    motivo: "Vacaciones",
    estado: s.estado,
    puedeCancel: permisos.has(PERMISSIONS.cancelarVacacionesPropias),
  }));

  const puedeAprobarEquipo = permisos.has(PERMISSIONS.aprobarVacacionesEquipo);
  const puedeAprobarGlobal = permisos.has(PERMISSIONS.aprobarVacacionesGlobal);

  let filasEquipo: FilaSolicitud[] = [];
  if (puedeAprobarEquipo || puedeAprobarGlobal) {
    const equipoIds = puedeAprobarGlobal ? undefined : await getEquipoIds(user.id);
    const pendientes = await prisma.solicitudAusencia.findMany({
      where: {
        estado: "PENDIENTE",
        tipoAusenciaCodigo: "VACACIONES",
        // spec §7.5/AC-10: un manager/RRHH nunca aprueba su propia solicitud,
        // así que ni siquiera debe aparecer en su bandeja de aprobaciones.
        userId: equipoIds ? { in: equipoIds } : { not: user.id },
      },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    });
    filasEquipo = pendientes.map((s) => ({
      id: s.id,
      empleado: s.user.name,
      fechaInicio: s.fechaInicio,
      fechaFin: s.fechaFin,
      dias: s.dias,
      motivo: "Vacaciones",
      estado: s.estado,
    }));
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Vacaciones" }]} />

      <div className="grid gap-6 lg:grid-cols-2">
        <SaldoCard
          totalAnual={resumen.totalAnual + resumen.arrastre}
          disponible={resumen.disponible}
          reservado={resumen.reservado}
          consumido={resumen.consumido}
        />
        <Card>
          <SolicitarForm />
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 font-bold text-foreground">Mis solicitudes</h2>
        <SolicitudesTable filas={filasMias} />
      </Card>

      {puedeAprobarEquipo || puedeAprobarGlobal ? (
        <Card>
          <h2 className="mb-4 font-bold text-foreground">
            Aprobaciones pendientes {puedeAprobarGlobal ? "(global)" : "(mi equipo)"}
          </h2>
          <SolicitudesTable
            filas={filasEquipo}
            modoAprobacion
            ambito={puedeAprobarGlobal ? "global" : "equipo"}
          />
        </Card>
      ) : null}
    </div>
  );
}
