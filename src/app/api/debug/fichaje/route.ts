import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import {
  computeEstadoJornada,
  getAccionEsperada,
  getFechaLaboral,
  getJornadaVigente,
  getMarcacionesDelDia,
} from "@/lib/fichajes";
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

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email },
      ahora: ahora.toISOString(),
      fechaLaboral: fechaLaboral.toISOString(),
      jornada: { id: jornada.id, tieneTramo2: jornada.tieneTramo2 },
      marcacionesCount: marcaciones.length,
      marcaciones,
      estado,
      accion,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) });
  }
}
