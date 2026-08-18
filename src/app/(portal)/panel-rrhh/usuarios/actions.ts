"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/authz";
import { PERMISSIONS, PERMISSION_GROUPS } from "@/lib/permissions";
import type { PermissionCode } from "@/lib/permissions";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function actualizarAtributosUsuario(
  userId: string,
  data: { departamento?: string; managerId?: string | null; estado?: "ACTIVO" | "BAJA" }
): Promise<ActionResult> {
  try {
    const actor = await requirePermission(PERMISSIONS.gestionarUsuariosRrhh);

    const antes = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          departamento: data.departamento,
          managerId: data.managerId,
          estado: data.estado,
          fechaBaja: data.estado === "BAJA" ? new Date() : data.estado === "ACTIVO" ? null : undefined,
        },
      }),
      prisma.auditLog.create({
        data: {
          actorId: actor.id,
          accion: "ACTUALIZAR_ATRIBUTOS_USUARIO",
          entidad: "User",
          entidadId: userId,
          valoresAntes: { departamento: antes.departamento, managerId: antes.managerId, estado: antes.estado },
          valoresDespues: data,
        },
      }),
    ]);

    revalidatePath("/panel-rrhh/usuarios");
    return { ok: true };
  } catch (error: unknown) {
    console.error("Error en actualizarAtributosUsuario:", error);
    const message = error instanceof Error ? error.message : "Error desconocido";
    return { ok: false, error: `Error al actualizar usuario: ${message}` };
  }
}

export async function asignarGrupoPermisos(userId: string, grupo: "empleado" | "manager" | "rrhh"): Promise<ActionResult> {
  try {
    const actor = await requirePermission(PERMISSIONS.gestionarUsuariosRrhh);

    const permisosCodes = PERMISSION_GROUPS[grupo];
    if (!permisosCodes) return { ok: false, error: "Grupo de permisos inválido" };

    await prisma.$transaction(async (tx) => {
      // Eliminar permisos existentes
      await tx.userPermission.deleteMany({ where: { userId } });

      // Asignar nuevos permisos del grupo
      for (const code of permisosCodes) {
        await tx.userPermission.create({
          data: { userId, permissionCode: code },
        });
      }

      // Auditar
      await tx.auditLog.create({
        data: {
          actorId: actor.id,
          accion: "ASIGNAR_PERMISOS_USUARIO",
          entidad: "User",
          entidadId: userId,
          valoresDespues: { grupo },
        },
      });
    });

    revalidatePath("/panel-rrhh/usuarios");
    return { ok: true };
  } catch (error: unknown) {
    console.error("Error en asignarGrupoPermisos:", error);
    const message = error instanceof Error ? error.message : "Error desconocido";
    return { ok: false, error: `Error al asignar permisos: ${message}` };
  }
}

export async function asignarPermisosIndividuales(userId: string, permisos: PermissionCode[]): Promise<ActionResult> {
  try {
    const actor = await requirePermission(PERMISSIONS.gestionarUsuariosRrhh);

    const permisosUnicos = Array.from(new Set(permisos));

    await prisma.$transaction(async (tx) => {
      // Eliminar permisos existentes
      await tx.userPermission.deleteMany({ where: { userId } });

      // Asignar nuevos permisos
      for (const code of permisosUnicos) {
        await tx.userPermission.create({
          data: { userId, permissionCode: code },
        });
      }

      // Auditar
      await tx.auditLog.create({
        data: {
          actorId: actor.id,
          accion: "ASIGNAR_PERMISOS_USUARIO",
          entidad: "User",
          entidadId: userId,
          valoresDespues: { permisos: permisosUnicos },
        },
      });
    });

    revalidatePath("/panel-rrhh/usuarios");
    return { ok: true };
  } catch (error: unknown) {
    console.error("Error en asignarPermisosIndividuales:", error);
    const message = error instanceof Error ? error.message : "Error desconocido";
    return { ok: false, error: `Error al asignar permisos: ${message}` };
  }
}
