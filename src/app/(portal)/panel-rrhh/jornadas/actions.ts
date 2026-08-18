"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/authz";
import { PERMISSIONS } from "@/lib/permissions";

export type ActionResult = { ok: true; data?: unknown } | { ok: false; error: string };

export async function crearJornada(data: {
  nombre: string;
  tipo: string;
  tieneTramo2: boolean;
  horasSemana?: number;
  tramo1Inicio?: number;
  tramo1Fin?: number;
  tramo2Inicio?: number;
  tramo2Fin?: number;
  toleranciaEntradaMin?: number;
  toleranciaSalidaMin?: number;
}): Promise<ActionResult> {
  try {
    const actor = await requirePermission(PERMISSIONS.gestionarJornadas);

    if (!data.nombre) return { ok: false, error: "El nombre de la jornada es obligatorio" };
    if (!data.tipo) return { ok: false, error: "El tipo de jornada es obligatorio" };

    const jornada = await prisma.jornadaPlantilla.create({
      data: {
        nombre: data.nombre,
        tipo: data.tipo,
        tieneTramo2: data.tieneTramo2,
        horasSemana: data.horasSemana || null,
        tramo1Inicio: data.tramo1Inicio || null,
        tramo1Fin: data.tramo1Fin || null,
        tramo2Inicio: data.tramo2Inicio || null,
        tramo2Fin: data.tramo2Fin || null,
        toleranciaEntradaMin: data.toleranciaEntradaMin ?? 10,
        toleranciaSalidaMin: data.toleranciaSalidaMin ?? 10,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        accion: "CREAR_JORNADA",
        entidad: "JornadaPlantilla",
        entidadId: jornada.id,
        valoresDespues: data,
      },
    });

    revalidatePath("/panel-rrhh/jornadas");
    return { ok: true, data: jornada };
  } catch (error: unknown) {
    console.error("Error en crearJornada:", error);
    const message = error instanceof Error ? error.message : "Error desconocido";
    return { ok: false, error: `Error al crear jornada: ${message}` };
  }
}

export async function actualizarJornada(
  jornadaId: string,
  data: {
    nombre: string;
    tipo: string;
    tieneTramo2: boolean;
    horasSemana?: number;
    tramo1Inicio?: number;
    tramo1Fin?: number;
    tramo2Inicio?: number;
    tramo2Fin?: number;
    toleranciaEntradaMin?: number;
    toleranciaSalidaMin?: number;
  }
): Promise<ActionResult> {
  try {
    const actor = await requirePermission(PERMISSIONS.gestionarJornadas);

    const antes = await prisma.jornadaPlantilla.findUniqueOrThrow({
      where: { id: jornadaId },
    });

    const jornada = await prisma.jornadaPlantilla.update({
      where: { id: jornadaId },
      data: {
        nombre: data.nombre,
        tipo: data.tipo,
        tieneTramo2: data.tieneTramo2,
        horasSemana: data.horasSemana || null,
        tramo1Inicio: data.tramo1Inicio || null,
        tramo1Fin: data.tramo1Fin || null,
        tramo2Inicio: data.tramo2Inicio || null,
        tramo2Fin: data.tramo2Fin || null,
        toleranciaEntradaMin: data.toleranciaEntradaMin ?? 10,
        toleranciaSalidaMin: data.toleranciaSalidaMin ?? 10,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        accion: "ACTUALIZAR_JORNADA",
        entidad: "JornadaPlantilla",
        entidadId: jornadaId,
        valoresAntes: {
          nombre: antes.nombre,
          tipo: antes.tipo,
          horasSemana: antes.horasSemana,
        },
        valoresDespues: data,
      },
    });

    revalidatePath("/panel-rrhh/jornadas");
    return { ok: true, data: jornada };
  } catch (error: unknown) {
    console.error("Error en actualizarJornada:", error);
    const message = error instanceof Error ? error.message : "Error desconocido";
    return { ok: false, error: `Error al actualizar jornada: ${message}` };
  }
}
