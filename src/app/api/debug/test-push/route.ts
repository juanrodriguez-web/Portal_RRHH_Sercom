import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import {
  computeEstadoJornada,
  getAccionEsperada,
  getFechaLaboral,
  getJornadaVigente,
  getMarcacionesDelDia,
} from "@/lib/fichajes";
import { enviarPushAUsuario } from "@/lib/push";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await requireUser();
    const ahora = new Date();
    const fechaLaboral = getFechaLaboral(ahora, "NO_INICIADA");
    const jornada = await getJornadaVigente(user.id, ahora);

    if (!jornada) {
      return NextResponse.json({ error: "No jornada assigned" });
    }

    const marcaciones = await getMarcacionesDelDia(user.id, fechaLaboral);
    const estado = computeEstadoJornada(marcaciones, jornada);
    const accion = getAccionEsperada(estado, jornada);

    if (!accion) {
      return NextResponse.json({ error: "No pending action" });
    }

    const suscripcion = await prisma.pushSubscription.findFirst({
      where: { userId: user.id },
    });

    if (!suscripcion) {
      return NextResponse.json({ error: "No push subscription found" });
    }

    await enviarPushAUsuario(user.id, {
      titulo: "Fichaje pendiente",
      cuerpo: `¿Ya fichaste tu ${accion.etiqueta.toLowerCase()}?`,
    });

    return NextResponse.json({
      ok: true,
      message: "Push notification sent",
      accion: accion.etiqueta,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
