"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/authz";
import { PERMISSIONS } from "@/lib/permissions";

export type Result = { ok: true } | { ok: false; error: string };

export async function crearComunicado(
  titulo: string,
  contenido: string,
  importante: boolean
): Promise<Result> {
  const user = await requirePermission(PERMISSIONS.crearComunicados);

  if (!titulo.trim() || !contenido.trim()) {
    return { ok: false, error: "Título y contenido son obligatorios." };
  }

  if (titulo.length > 200) {
    return { ok: false, error: "El título no puede exceder 200 caracteres." };
  }

  await prisma.comunicado.create({
    data: {
      titulo: titulo.trim(),
      contenido: contenido.trim(),
      importante,
      autorId: user.id,
    },
  });

  revalidatePath("/comunicados");
  return { ok: true };
}

export async function archivarComunicado(comunicadoId: string): Promise<Result> {
  const user = await requirePermission(PERMISSIONS.crearComunicados);

  const comunicado = await prisma.comunicado.findUnique({ where: { id: comunicadoId } });
  if (!comunicado) {
    return { ok: false, error: "Comunicado no encontrado." };
  }

  await prisma.comunicado.update({
    where: { id: comunicadoId },
    data: { archivado: true },
  });

  revalidatePath("/comunicados");
  return { ok: true };
}

export async function marcarImportante(comunicadoId: string, importante: boolean): Promise<Result> {
  const user = await requirePermission(PERMISSIONS.crearComunicados);

  const comunicado = await prisma.comunicado.findUnique({ where: { id: comunicadoId } });
  if (!comunicado) {
    return { ok: false, error: "Comunicado no encontrado." };
  }

  await prisma.comunicado.update({
    where: { id: comunicadoId },
    data: { importante },
  });

  revalidatePath("/comunicados");
  return { ok: true };
}
