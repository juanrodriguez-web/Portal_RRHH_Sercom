import "server-only";
import { prisma } from "@/lib/prisma";
import type { Marcacion, JornadaPlantilla } from "@/generated/prisma/client";

export type EstadoJornada =
  | "NO_INICIADA"
  | "EN_TRAMO_1"
  | "EN_PAUSA"
  | "EN_TRAMO_2"
  | "FINALIZADA";

export type AccionFichaje = {
  tipo: "ENTRADA" | "SALIDA";
  tramo: 1 | 2;
  etiqueta: string;
};

/** spec §6.2 — la máquina de estados se deriva de los eventos, nunca se guarda. */
export function computeEstadoJornada(
  marcacionesHoy: Pick<Marcacion, "tipo" | "tramo">[],
  jornada: Pick<JornadaPlantilla, "tieneTramo2">
): EstadoJornada {
  const find = (tipo: "ENTRADA" | "SALIDA", tramo: number) =>
    marcacionesHoy.some((m) => m.tipo === tipo && m.tramo === tramo);

  const e1 = find("ENTRADA", 1);
  const s1 = find("SALIDA", 1);
  const e2 = find("ENTRADA", 2);
  const s2 = find("SALIDA", 2);

  if (!e1) return "NO_INICIADA";
  if (!s1) return "EN_TRAMO_1";
  if (!jornada.tieneTramo2) return "FINALIZADA";
  if (!e2) return "EN_PAUSA";
  if (!s2) return "EN_TRAMO_2";
  return "FINALIZADA";
}

const ACCIONES_PARTIDA: Record<EstadoJornada, AccionFichaje | null> = {
  NO_INICIADA: { tipo: "ENTRADA", tramo: 1, etiqueta: "Entrada mañana" },
  EN_TRAMO_1: { tipo: "SALIDA", tramo: 1, etiqueta: "Fin de mañana" },
  EN_PAUSA: { tipo: "ENTRADA", tramo: 2, etiqueta: "Entrada tarde" },
  EN_TRAMO_2: { tipo: "SALIDA", tramo: 2, etiqueta: "Fin de jornada" },
  FINALIZADA: null,
};

const ACCIONES_CONTINUA: Record<EstadoJornada, AccionFichaje | null> = {
  NO_INICIADA: { tipo: "ENTRADA", tramo: 1, etiqueta: "Entrada" },
  EN_TRAMO_1: { tipo: "SALIDA", tramo: 1, etiqueta: "Fin de jornada" },
  EN_PAUSA: null,
  EN_TRAMO_2: null,
  FINALIZADA: null,
};

/** spec §6.3 — jornada sin pausa solo muestra Entrada / Fin de jornada. */
export function getAccionEsperada(
  estado: EstadoJornada,
  jornada: Pick<JornadaPlantilla, "tieneTramo2">
): AccionFichaje | null {
  return jornada.tieneTramo2 ? ACCIONES_PARTIDA[estado] : ACCIONES_CONTINUA[estado];
}

/** spec §6.3 — jornada que cruza medianoche se asocia a la fecha de inicio. */
export function getFechaLaboral(referencia: Date, estado: EstadoJornada): Date {
  const fecha = new Date(Date.UTC(referencia.getUTCFullYear(), referencia.getUTCMonth(), referencia.getUTCDate()));
  // Si ya hay una jornada abierta (entrada sin salida) tras medianoche, seguimos
  // buscando la fecha laboral del día anterior antes de abrir una nueva.
  if (estado === "NO_INICIADA" && referencia.getUTCHours() < 4) {
    fecha.setUTCDate(fecha.getUTCDate() - 1);
  }
  return fecha;
}

export async function getJornadaVigente(userId: string, fecha: Date) {
  const asignacion = await prisma.asignacionJornada.findFirst({
    where: {
      userId,
      vigenteDesde: { lte: fecha },
      OR: [{ vigenteHasta: null }, { vigenteHasta: { gte: fecha } }],
    },
    orderBy: { vigenteDesde: "desc" },
    include: { jornada: true },
  });
  return asignacion?.jornada ?? null;
}

export async function getMarcacionesDelDia(userId: string, fechaLaboral: Date) {
  return prisma.marcacion.findMany({
    where: { userId, fechaLaboral },
    orderBy: [{ tramo: "asc" }, { tipo: "asc" }],
  });
}

/**
 * Resuelve el valor "vigente" de una marcación para mostrar en histórico y
 * reportes: el original si no tiene correcciones aprobadas, o el valor
 * propuesto de la corrección aprobada más reciente si la tiene. El registro
 * original nunca se toca (spec §6.6).
 */
export function resolverValorVigente(
  marcacion: Pick<Marcacion, "timestampServidor">,
  correcciones: { estado: string; valorPropuesto: Date; createdAt: Date }[]
): { valor: Date; corregida: boolean } {
  const aprobadas = correcciones
    .filter((c) => c.estado === "APROBADA")
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  if (aprobadas.length === 0) return { valor: marcacion.timestampServidor, corregida: false };
  return { valor: aprobadas[0].valorPropuesto, corregida: true };
}

export type FilaHistoricoData = {
  fecha: Date;
  entradaManana: Date | null;
  salidaManana: Date | null;
  entradaTarde: Date | null;
  salidaTarde: Date | null;
  totalMinutos: number;
  corregida: boolean;
  estado: "OK" | "INCOMPLETO" | "AUSENCIA";
  empleado?: string;
};

/** Histórico paginado por rango de fechas para un empleado (spec §6.7). */
export async function getHistoricoUsuario(
  userId: string,
  desde: Date,
  hasta: Date,
  nombreEmpleado?: string
): Promise<FilaHistoricoData[]> {
  const [marcaciones, ausencias] = await Promise.all([
    prisma.marcacion.findMany({
      where: { userId, fechaLaboral: { gte: desde, lte: hasta } },
      include: { correcciones: true },
      orderBy: { fechaLaboral: "asc" },
    }),
    prisma.solicitudAusencia.findMany({
      where: {
        userId,
        estado: "APROBADA",
        fechaInicio: { lte: hasta },
        fechaFin: { gte: desde },
      },
    }),
  ]);

  const porDia = new Map<string, typeof marcaciones>();
  for (const m of marcaciones) {
    const key = m.fechaLaboral.toISOString().slice(0, 10);
    if (!porDia.has(key)) porDia.set(key, []);
    porDia.get(key)!.push(m);
  }

  const filas: FilaHistoricoData[] = [];
  for (const [key, delDia] of porDia) {
    const get = (tipo: "ENTRADA" | "SALIDA", tramo: number) => {
      const m = delDia.find((x) => x.tipo === tipo && x.tramo === tramo);
      if (!m) return { valor: null as Date | null, corregida: false };
      const { valor, corregida } = resolverValorVigente(m, m.correcciones);
      return { valor, corregida };
    };
    const em = get("ENTRADA", 1);
    const sm = get("SALIDA", 1);
    const et = get("ENTRADA", 2);
    const st = get("SALIDA", 2);

    const esAusencia = ausencias.some((a) => {
      const fecha = new Date(key);
      return a.fechaInicio <= fecha && a.fechaFin >= fecha;
    });

    const completo = em.valor && sm.valor && (et.valor ? st.valor : true);

    filas.push({
      fecha: new Date(key),
      entradaManana: em.valor,
      salidaManana: sm.valor,
      entradaTarde: et.valor,
      salidaTarde: st.valor,
      totalMinutos: minutosTrabajados(delDia),
      corregida: em.corregida || sm.corregida || et.corregida || st.corregida,
      estado: esAusencia ? "AUSENCIA" : completo ? "OK" : "INCOMPLETO",
      empleado: nombreEmpleado,
    });
  }

  return filas.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
}

export async function tieneAusenciaAprobadaHoy(userId: string, fecha: Date) {
  const dia = new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate()));
  const count = await prisma.solicitudAusencia.count({
    where: { userId, estado: "APROBADA", fechaInicio: { lte: dia }, fechaFin: { gte: dia } },
  });
  return count > 0;
}

export async function esFestivoHoy(fecha: Date) {
  const dia = new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate()));
  const count = await prisma.festivo.count({ where: { fecha: dia } });
  return count > 0;
}

export function minutosTrabajados(marcaciones: Pick<Marcacion, "tipo" | "tramo" | "timestampServidor">[]) {
  let total = 0;
  for (const tramo of [1, 2]) {
    const entrada = marcaciones.find((m) => m.tipo === "ENTRADA" && m.tramo === tramo);
    const salida = marcaciones.find((m) => m.tipo === "SALIDA" && m.tramo === tramo);
    if (entrada && salida) {
      total += (salida.timestampServidor.getTime() - entrada.timestampServidor.getTime()) / 60000;
    } else if (entrada && !salida) {
      total += (Date.now() - entrada.timestampServidor.getTime()) / 60000;
    }
  }
  return Math.max(0, Math.round(total));
}
