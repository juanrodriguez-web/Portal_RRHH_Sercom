"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission, getEquipoIds, AuthzError } from "@/lib/authz";
import { PERMISSIONS } from "@/lib/permissions";
import { contarDiasLaborables, getResumenSaldo, haySolapamiento } from "@/lib/vacaciones";

export type AccionResult = { ok: true } | { ok: false; error: string };

export async function solicitarVacaciones(
  fechaInicioISO: string,
  fechaFinISO: string,
  comentario: string
): Promise<AccionResult> {
  try {
    const user = await requirePermission(PERMISSIONS.solicitarVacaciones);

    const fechaInicio = new Date(fechaInicioISO);
    const fechaFin = new Date(fechaFinISO);

    if (Number.isNaN(fechaInicio.getTime()) || Number.isNaN(fechaFin.getTime())) {
      return { ok: false, error: "Fechas no válidas." };
    }
    if (fechaFin < fechaInicio) {
      return { ok: false, error: "La fecha de fin debe ser igual o posterior a la de inicio." };
    }

    const hoy = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()));
    if (fechaInicio < hoy) {
      return { ok: false, error: "No se admiten solicitudes sobre fechas pasadas." };
    }

    if (await haySolapamiento(user.id, fechaInicio, fechaFin)) {
      return { ok: false, error: "Ya tienes una solicitud activa que se solapa con esas fechas." };
    }

    const dias = await contarDiasLaborables(fechaInicio, fechaFin);
    if (dias === 0) {
      return { ok: false, error: "El rango seleccionado no tiene días laborables." };
    }

    const anio = fechaInicio.getUTCFullYear();
    const resumen = await getResumenSaldo(user.id, anio);
    if (dias > resumen.disponible) {
      return { ok: false, error: `Saldo insuficiente: solo tienes ${resumen.disponible} días disponibles.` };
    }
    if (!resumen.saldoId) {
      return { ok: false, error: "No tienes saldo de vacaciones configurado para este año. Contacta con RRHH." };
    }

    const dbUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });

    await prisma.$transaction(async (tx) => {
      const solicitud = await tx.solicitudAusencia.create({
        data: {
          userId: user.id,
          tipoAusenciaCodigo: "VACACIONES",
          fechaInicio,
          fechaFin,
          dias,
          comentario: comentario || null,
          estado: "PENDIENTE",
          esExcepcionSinManager: !dbUser.managerId,
        },
      });
      await tx.movimientoSaldo.create({
        data: {
          saldoId: resumen.saldoId!,
          userId: user.id,
          tipo: "RESERVA",
          cantidad: -dias,
          solicitudId: solicitud.id,
          motivo: "Reserva al enviar solicitud",
        },
      });
    });

    revalidatePath("/vacaciones");
    revalidatePath("/inicio");
    return { ok: true };
  } catch (error: unknown) {
    console.error("Error en solicitarVacaciones:", error);
    const message = error instanceof Error ? error.message : "Error desconocido";
    return { ok: false, error: `Error al solicitar vacaciones: ${message}` };
  }
}

export async function cancelarSolicitud(solicitudId: string): Promise<AccionResult> {
  try {
    const user = await requirePermission(PERMISSIONS.cancelarVacacionesPropias);

    const solicitud = await prisma.solicitudAusencia.findUnique({ where: { id: solicitudId } });
    if (!solicitud || solicitud.userId !== user.id) return { ok: false, error: "Solicitud no encontrada." };
    if (solicitud.estado !== "PENDIENTE") {
      return { ok: false, error: "Solo se pueden cancelar solicitudes pendientes." };
    }

    const resumen = await getResumenSaldo(user.id, solicitud.fechaInicio.getUTCFullYear());
    await prisma.$transaction(async (tx) => {
      await tx.solicitudAusencia.update({
        where: { id: solicitudId },
        data: { estado: "CANCELADA", resueltoAt: new Date() },
      });
      if (resumen.saldoId) {
        await tx.movimientoSaldo.create({
          data: {
            saldoId: resumen.saldoId,
            userId: user.id,
            tipo: "LIBERACION_RESERVA",
            cantidad: solicitud.dias,
            solicitudId,
            motivo: "Cancelación por el empleado",
          },
        });
      }
    });

    revalidatePath("/vacaciones");
    revalidatePath("/inicio");
    return { ok: true };
  } catch (error: unknown) {
    console.error("Error en cancelarSolicitud:", error);
    const message = error instanceof Error ? error.message : "Error desconocido";
    return { ok: false, error: `Error al cancelar solicitud: ${message}` };
  }
}

export async function resolverSolicitud(
  solicitudId: string,
  aprobar: boolean,
  ambito: "equipo" | "global",
  motivo?: string
): Promise<AccionResult> {
  try {
    const user = await requirePermission(
      ambito === "global" ? PERMISSIONS.aprobarVacacionesGlobal : PERMISSIONS.aprobarVacacionesEquipo
    );

    const solicitud = await prisma.solicitudAusencia.findUnique({ where: { id: solicitudId } });
    if (!solicitud) return { ok: false, error: "Solicitud no encontrada." };
    if (solicitud.estado !== "PENDIENTE") return { ok: false, error: "La solicitud ya fue resuelta." };
    if (solicitud.userId === user.id) {
      // spec §7.5 — un manager no puede aprobar su propia solicitud.
      return { ok: false, error: "No puedes aprobar tu propia solicitud." };
    }

    if (ambito === "equipo") {
      const equipoIds = await getEquipoIds(user.id);
      if (!equipoIds.includes(solicitud.userId)) {
        return { ok: false, error: "Esa solicitud no pertenece a tu equipo." };
      }
    }

    const resumen = await getResumenSaldo(solicitud.userId, solicitud.fechaInicio.getUTCFullYear());

    await prisma.$transaction(async (tx) => {
      await tx.solicitudAusencia.update({
        where: { id: solicitudId },
        data: {
          estado: aprobar ? "APROBADA" : "RECHAZADA",
          aprobadorId: user.id,
          motivoResolucion: motivo || null,
          resueltoAt: new Date(),
        },
      });
      if (!aprobar && resumen.saldoId) {
        // La reserva se libera; el consumo definitivo solo ocurre al aprobar,
        // así que aquí no hace falta otro movimiento adicional (spec §7.3).
        await tx.movimientoSaldo.create({
          data: {
            saldoId: resumen.saldoId,
            userId: solicitud.userId,
            tipo: "LIBERACION_RESERVA",
            cantidad: solicitud.dias,
            solicitudId,
            motivo: motivo || "Rechazada",
          },
        });
      }
    });

    revalidatePath("/vacaciones");
    revalidatePath("/panel-rrhh");
    return { ok: true };
  } catch (error: unknown) {
    console.error("Error en resolverSolicitud:", error);
    const message = error instanceof Error ? error.message : "Error desconocido";
    return { ok: false, error: `Error al resolver solicitud: ${message}` };
  }
}
