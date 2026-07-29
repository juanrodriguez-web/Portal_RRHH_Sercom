import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * "Disponible" siempre se recalcula a partir del estado real de las
 * solicitudes (PENDIENTE = reservado, APROBADA = consumido), no sumando
 * movimientos de saldo con signo — así no hay riesgo de doble descuento.
 * `MovimientoSaldo` queda como log de auditoría inmutable (spec §7.3),
 * pero nunca es la fuente de verdad para el cálculo.
 */
export async function getResumenSaldo(userId: string, anio: number) {
  const saldo = await prisma.saldoVacaciones.findUnique({ where: { userId_anio: { userId, anio } } });
  const totalAnual = saldo?.totalAnual ?? 0;
  const arrastre = saldo?.arrastre ?? 0;

  const solicitudes = await prisma.solicitudAusencia.findMany({
    where: {
      userId,
      tipoAusenciaCodigo: "VACACIONES",
      estado: { in: ["PENDIENTE", "APROBADA"] },
      fechaInicio: { gte: new Date(Date.UTC(anio, 0, 1)) },
      fechaFin: { lte: new Date(Date.UTC(anio, 11, 31)) },
    },
  });

  const reservado = solicitudes.filter((s) => s.estado === "PENDIENTE").reduce((acc, s) => acc + s.dias, 0);
  const consumido = solicitudes.filter((s) => s.estado === "APROBADA").reduce((acc, s) => acc + s.dias, 0);
  const disponible = totalAnual + arrastre - reservado - consumido;

  return { totalAnual, arrastre, reservado, consumido, disponible, saldoId: saldo?.id ?? null };
}

/** Cuenta días laborables (excluye sáb/dom y festivos) entre dos fechas, ambas inclusive. */
export async function contarDiasLaborables(fechaInicio: Date, fechaFin: Date) {
  const festivos = await prisma.festivo.findMany({
    where: { fecha: { gte: fechaInicio, lte: fechaFin } },
    select: { fecha: true },
  });
  const festivosSet = new Set(festivos.map((f) => f.fecha.toISOString().slice(0, 10)));

  let dias = 0;
  const cursor = new Date(fechaInicio);
  while (cursor <= fechaFin) {
    const diaSemana = cursor.getUTCDay(); // 0 domingo, 6 sábado
    const key = cursor.toISOString().slice(0, 10);
    if (diaSemana !== 0 && diaSemana !== 6 && !festivosSet.has(key)) dias++;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dias;
}

/** spec §7.4 — no puede existir solapamiento con otra solicitud activa (mismo tipo). */
export async function haySolapamiento(userId: string, fechaInicio: Date, fechaFin: Date, excluirId?: string) {
  const count = await prisma.solicitudAusencia.count({
    where: {
      userId,
      id: excluirId ? { not: excluirId } : undefined,
      estado: { in: ["PENDIENTE", "APROBADA"] },
      fechaInicio: { lte: fechaFin },
      fechaFin: { gte: fechaInicio },
    },
  });
  return count > 0;
}
