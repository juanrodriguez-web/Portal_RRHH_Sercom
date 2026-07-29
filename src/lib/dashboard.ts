import "server-only";
import { prisma } from "@/lib/prisma";
import { computeEstadoJornada, getFechaLaboral, getJornadaVigente } from "@/lib/fichajes";

export async function getKpisRRHH() {
  const hoy = getFechaLaboral(new Date(), "NO_INICIADA");

  const [empleadosActivos, sinJornada, sinManager, solicitudesPendientes] = await Promise.all([
    prisma.user.count({ where: { estado: "ACTIVO" } }),
    prisma.user.count({ where: { estado: "ACTIVO", asignacionesJornada: { none: {} } } }),
    prisma.user.count({ where: { estado: "ACTIVO", managerId: null } }),
    prisma.solicitudAusencia.count({ where: { estado: "PENDIENTE" } }),
  ]);

  const usuarios = await prisma.user.findMany({ where: { estado: "ACTIVO" } });
  let enJornada = 0;
  let finalizados = 0;
  let incompletos = 0;

  for (const u of usuarios) {
    const jornada = await getJornadaVigente(u.id, new Date());
    if (!jornada) continue;
    const marcaciones = await prisma.marcacion.findMany({ where: { userId: u.id, fechaLaboral: hoy } });
    const estado = computeEstadoJornada(marcaciones, jornada);
    if (estado === "FINALIZADA") finalizados++;
    else if (estado === "NO_INICIADA") incompletos++;
    else enJornada++;
  }

  const ausenciasProximas = await prisma.solicitudAusencia.count({
    where: {
      estado: "APROBADA",
      fechaInicio: { gte: hoy, lte: new Date(hoy.getTime() + 7 * 86_400_000) },
    },
  });

  return {
    empleadosActivos,
    sinJornada,
    sinManager,
    solicitudesPendientes,
    enJornada,
    finalizados,
    incompletos,
    ausenciasProximas,
  };
}
