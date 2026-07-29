"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/authz";
import { PERMISSIONS } from "@/lib/permissions";

export async function actualizarAtributosUsuario(
  userId: string,
  data: { departamento?: string; managerId?: string | null; estado?: "ACTIVO" | "BAJA" }
) {
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
}
