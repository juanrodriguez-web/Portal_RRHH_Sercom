import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enviarPushAUsuario } from "@/lib/push";
import {
  computeEstadoJornada,
  getAccionEsperada,
  getFechaLaboral,
  getJornadaVigente,
  getMarcacionesDelDia,
  esFestivoHoy,
  tieneAusenciaAprobadaHoy,
} from "@/lib/fichajes";

const REPETICION_MS = 15 * 60_000; // spec §6.4

function umbralMinutos(
  accionTipo: "ENTRADA" | "SALIDA",
  tramo: 1 | 2,
  jornada: { tramo1Inicio: number; tramo1Fin: number; tramo2Inicio: number | null; tramo2Fin: number | null; toleranciaEntradaMin: number; toleranciaSalidaMin: number }
) {
  if (accionTipo === "ENTRADA") {
    const base = tramo === 1 ? jornada.tramo1Inicio : jornada.tramo2Inicio ?? 0;
    return base + jornada.toleranciaEntradaMin;
  }
  const base = tramo === 1 ? jornada.tramo1Fin : jornada.tramo2Fin ?? 0;
  return base + jornada.toleranciaSalidaMin;
}

/**
 * Job programado (Vercel Cron, ver vercel.json) que revisa cada pocos
 * minutos quién debería haber fichado y no lo ha hecho, y envía un push
 * repitiendo cada 15 min hasta que fiche o termine la tolerancia (spec §6.4).
 * Protegido con CRON_SECRET: Vercel Cron manda `Authorization: Bearer <secret>`.
 */
export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const ahora = new Date();
  const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();
  const fechaLaboral = getFechaLaboral(ahora, "NO_INICIADA");

  if (await esFestivoHoy(ahora)) {
    return NextResponse.json({ enviados: 0, motivo: "festivo" });
  }

  const usuarios = await prisma.user.findMany({ where: { estado: "ACTIVO" } });

  let enviados = 0;
  for (const usuario of usuarios) {
    const jornada = await getJornadaVigente(usuario.id, ahora);
    if (!jornada) continue;
    if (await tieneAusenciaAprobadaHoy(usuario.id, ahora)) continue;

    const marcaciones = await getMarcacionesDelDia(usuario.id, fechaLaboral);
    const estado = computeEstadoJornada(marcaciones, jornada);
    const accion = getAccionEsperada(estado, jornada);
    if (!accion) continue;

    const umbral = umbralMinutos(accion.tipo, accion.tramo, jornada);
    if (minutosAhora < umbral) continue;

    const tipoRecordatorio = `${accion.tipo}_TRAMO_${accion.tramo}`;
    const recordatorio = await prisma.recordatorioFichaje.findUnique({
      where: { userId_fecha_tipo: { userId: usuario.id, fecha: fechaLaboral, tipo: tipoRecordatorio } },
    });
    if (recordatorio && Date.now() - recordatorio.ultimoEnvio.getTime() < REPETICION_MS) continue;

    await enviarPushAUsuario(usuario.id, {
      title: "Portal RRHH — Falta fichar",
      body: `¿Fichamos tu ${accion.etiqueta.toLowerCase()}?`,
      tag: "fichaje",
    });

    await prisma.recordatorioFichaje.upsert({
      where: { userId_fecha_tipo: { userId: usuario.id, fecha: fechaLaboral, tipo: tipoRecordatorio } },
      create: { userId: usuario.id, fecha: fechaLaboral, tipo: tipoRecordatorio },
      update: { ultimoEnvio: new Date() },
    });
    enviados++;
  }

  return NextResponse.json({ enviados });
}
