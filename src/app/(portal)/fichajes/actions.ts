"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission, AuthzError } from "@/lib/authz";
import { PERMISSIONS } from "@/lib/permissions";
import {
  computeEstadoJornada,
  getAccionEsperada,
  getFechaLaboral,
  getJornadaVigente,
  getMarcacionesDelDia,
} from "@/lib/fichajes";

export type MarcarFichajeResult = { ok: true } | { ok: false; error: string };

/**
 * Registra la siguiente acción esperada de la jornada del usuario autenticado.
 * Idempotente: la clave `userId:fecha:tipo:tramo` es única en BD, así que un
 * doble clic o un reintento de red no puede crear una marcación duplicada
 * (spec §6.3).
 */
export async function marcarFichaje(): Promise<MarcarFichajeResult> {
  try {
    const user = await requirePermission(PERMISSIONS.registrarFichajePropio);

    const jornada = await getJornadaVigente(user.id, new Date());
    if (!jornada) {
      return { ok: false, error: "No tienes una jornada asignada. Contacta con RRHH." };
    }

    const ahora = new Date();
    // Estado provisional del día "de hoy" para decidir si la marcación cruza
    // medianoche y pertenece a la jornada laboral de ayer (spec §6.3).
    const estadoHoy = computeEstadoJornada(await getMarcacionesDelDia(user.id, getFechaLaboral(ahora, "NO_INICIADA")), jornada);
    const fechaLaboral = getFechaLaboral(ahora, estadoHoy);

    const marcacionesDia = await getMarcacionesDelDia(user.id, fechaLaboral);
    const estado = computeEstadoJornada(marcacionesDia, jornada);
    const accion = getAccionEsperada(estado, jornada);

    if (!accion) {
      return { ok: false, error: "Tu jornada de hoy ya está finalizada." };
    }

    const idempotencyKey = `${user.id}:${fechaLaboral.toISOString().slice(0, 10)}:${accion.tipo}:${accion.tramo}`;

    try {
      await prisma.marcacion.create({
        data: {
          userId: user.id,
          tipo: accion.tipo,
          tramo: accion.tramo,
          timestampServidor: ahora,
          fechaLaboral,
          canalOrigen: "PORTAL_RRHH",
          idempotencyKey,
        },
      });
    } catch (err: unknown) {
      if (typeof err === "object" && err && "code" in err && err.code === "P2002") {
        return { ok: false, error: "Esa marcación ya estaba registrada." };
      }
      throw err;
    }

    revalidatePath("/fichajes");
    revalidatePath("/inicio");
    return { ok: true };
  } catch (error: unknown) {
    console.error("Error en marcarFichaje:", error);
    const message = error instanceof Error ? error.message : "Error desconocido";
    return { ok: false, error: `Error al registrar fichaje: ${message}` };
  }
}

export type SolicitarCorreccionResult = { ok: true } | { ok: false; error: string };

export async function solicitarCorreccion(
  marcacionId: string,
  valorPropuestoISO: string,
  motivo: string
): Promise<SolicitarCorreccionResult> {
  const user = await requirePermission(PERMISSIONS.solicitarCorreccionPropia);

  if (!motivo.trim()) return { ok: false, error: "El motivo es obligatorio." };

  const marcacion = await prisma.marcacion.findUnique({ where: { id: marcacionId } });
  if (!marcacion || marcacion.userId !== user.id) {
    return { ok: false, error: "Marcación no encontrada." };
  }

  await prisma.correccionMarcacion.create({
    data: {
      marcacionId,
      valorAnterior: marcacion.timestampServidor,
      valorPropuesto: new Date(valorPropuestoISO),
      motivo,
      solicitanteId: user.id,
    },
  });

  revalidatePath("/fichajes");
  return { ok: true };
}

export async function resolverCorreccion(
  correccionId: string,
  aprobar: boolean,
  ambito: "equipo" | "global"
) {
  const user = await requirePermission(
    ambito === "global" ? PERMISSIONS.corregirFichajeGlobal : PERMISSIONS.corregirFichajeEquipo
  );

  const correccion = await prisma.correccionMarcacion.findUnique({ where: { id: correccionId } });
  if (!correccion || correccion.estado !== "PENDIENTE") {
    throw new AuthzError("La corrección ya fue resuelta.");
  }

  // El registro original en `Marcacion` nunca se sobrescribe (spec §6.6): solo
  // se marca la corrección como aprobada. Los listados resuelven el "valor
  // vigente" leyendo la última corrección aprobada de cada marcación
  // (ver `resolverValorVigente` en src/lib/fichajes.ts).
  await prisma.correccionMarcacion.update({
    where: { id: correccionId },
    data: { estado: aprobar ? "APROBADA" : "RECHAZADA", aprobadorId: user.id, resueltoAt: new Date() },
  });

  revalidatePath("/panel-rrhh");
}
