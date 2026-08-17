import { requireUser, getUserPermissionCodes, getEquipoIds } from "@/lib/authz";
import { PERMISSIONS } from "@/lib/permissions";
import {
  computeEstadoJornada,
  getAccionEsperada,
  getFechaLaboral,
  getHistoricoUsuario,
  getJornadaVigente,
  getMarcacionesDelDia,
  minutosTrabajados,
} from "@/lib/fichajes";
import { prisma } from "@/lib/prisma";
import { RelojFichaje } from "@/components/fichajes/reloj-fichaje";
import { HistoricoTable } from "@/components/fichajes/historico-table";
import { EquipoSelector } from "@/components/fichajes/equipo-selector";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

function rangoFechas(rango: "semana" | "mes") {
  const hasta = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()));
  const desde = new Date(hasta);
  desde.setUTCDate(desde.getUTCDate() - (rango === "mes" ? 30 : 6));
  return { desde, hasta };
}

export default async function FichajesPage({
  searchParams,
}: {
  searchParams: Promise<{ rango?: string }>;
}) {
  const { rango } = await searchParams;
  const rangoSeleccionado = rango === "mes" ? "mes" : "semana";

  const user = await requireUser();
  const permisos = await getUserPermissionCodes(user.id);

  const jornada = await getJornadaVigente(user.id, new Date());
  const ahora = new Date();
  const fechaLaboralHoy = getFechaLaboral(ahora, "NO_INICIADA");
  const marcacionesHoy = jornada ? await getMarcacionesDelDia(user.id, fechaLaboralHoy) : [];
  const estado = jornada ? computeEstadoJornada(marcacionesHoy, jornada) : "NO_INICIADA";
  const accion = jornada ? getAccionEsperada(estado, jornada) : null;

  const { desde, hasta } = rangoFechas(rangoSeleccionado);
  const historico = await getHistoricoUsuario(user.id, desde, hasta);

  const puedeVerEquipo = permisos.has(PERMISSIONS.verFichajeEquipo);
  const puedeVerGlobal = permisos.has(PERMISSIONS.verFichajeGlobal);

  let equipoResumen: { nombre: string; estado: string }[] = [];
  if (puedeVerEquipo) {
    const equipoIds = await getEquipoIds(user.id);
    const empleados = await prisma.user.findMany({ where: { id: { in: equipoIds } } });
    equipoResumen = await Promise.all(
      empleados.map(async (emp) => {
        const j = await getJornadaVigente(emp.id, ahora);
        const marcaciones = j ? await getMarcacionesDelDia(emp.id, fechaLaboralHoy) : [];
        const est = j ? computeEstadoJornada(marcaciones, j) : "NO_INICIADA";
        return { nombre: emp.name, estado: est };
      })
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-[380px_1fr]">
        {jornada ? (
          <RelojFichaje
            estadoInicial={estado}
            accion={accion}
            minutosTrabajadosInicial={minutosTrabajados(marcacionesHoy)}
            marcacionesDelDia={marcacionesHoy.map((m) => ({ tipo: m.tipo, tramo: m.tramo }))}
          />
        ) : (
          <Card>
            <p className="text-sm text-muted-foreground">
              No tienes una jornada asignada todavía. Contacta con RRHH.
            </p>
          </Card>
        )}

        <Card>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-bold text-foreground">Histórico · últimos {rangoSeleccionado === "mes" ? "30 días" : "7 días"}</h2>
            <div className="flex gap-1.5 text-sm">
              <a
                href="/fichajes?rango=semana"
                className={`rounded-[var(--radius-control)] px-3 py-1.5 font-medium transition-colors ${rangoSeleccionado === "semana" ? "bg-brand-tint text-brand" : "text-muted-foreground hover:text-foreground hover:bg-background"}`}
              >
                Semana
              </a>
              <a
                href="/fichajes?rango=mes"
                className={`rounded-[var(--radius-control)] px-3 py-1.5 font-medium transition-colors ${rangoSeleccionado === "mes" ? "bg-brand-tint text-brand" : "text-muted-foreground hover:text-foreground hover:bg-background"}`}
              >
                Mes
              </a>
            </div>
          </div>
          <HistoricoTable filas={historico} />
        </Card>
      </div>

      {puedeVerEquipo ? (
        <Card>
          <EquipoSelector equipoResumen={equipoResumen} />
        </Card>
      ) : null}

      {puedeVerGlobal ? (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-foreground">Vista global RRHH</h2>
            <a
              href="/api/fichajes/export"
              className="rounded-[var(--radius-control)] border border-border-strong px-3 py-1.5 text-sm font-semibold hover:bg-background"
            >
              Excel
            </a>
          </div>
          <p className="text-sm text-muted-foreground">
            Consulta detallada disponible en Panel RRHH → Reportes.
          </p>
        </Card>
      ) : null}
    </div>
  );
}
