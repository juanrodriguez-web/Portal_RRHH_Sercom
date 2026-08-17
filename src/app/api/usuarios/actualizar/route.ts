import { getSession } from "@/lib/auth";
import { requirePermission } from "@/lib/authz";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  try {
    await requirePermission(PERMISSIONS.editarUsuariosRrhh);
  } catch {
    return new Response("Forbidden", { status: 403 });
  }

  const body = await req.json();
  const { usuarioId, departamento, managerId, estado, grupoPermisos } = body;

  if (!usuarioId) {
    return new Response("Missing usuarioId", { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: usuarioId } });
    if (!user) {
      return new Response("Usuario no encontrado", { status: 404 });
    }

    // Actualizar atributos básicos
    if (departamento !== undefined || managerId !== undefined || estado !== undefined) {
      await prisma.user.update({
        where: { id: usuarioId },
        data: {
          ...(departamento !== undefined && { departamento }),
          ...(managerId !== undefined && { managerId }),
          ...(estado !== undefined && { estado }),
        },
      });

      // Audit log
      await prisma.auditLog.create({
        data: {
          actor: session.user.id,
          accion: "ACTUALIZAR_USUARIO",
          entidad: "User",
          entidadId: usuarioId,
          motivo: "Actualización de atributos RRHH",
          before: {
            departamento: user.departamento,
            managerId: user.managerId,
            estado: user.estado,
          },
          after: {
            departamento: departamento ?? user.departamento,
            managerId: managerId ?? user.managerId,
            estado: estado ?? user.estado,
          },
        },
      });
    }

    // Asignar grupo de permisos si se envía
    if (grupoPermisos && grupoPermisos !== "") {
      const PERMISSION_GROUPS: Record<string, string[]> = {
        empleado: ["registrarFichajePropio", "verOwnFichajes", "solicitudAusenciasPropio"],
        manager: [
          "registrarFichajePropio",
          "verOwnFichajes",
          "solicitudAusenciasPropio",
          "verEquipoFichajes",
          "aprobarVacacionesEquipo",
          "verEquipoVacaciones",
        ],
        rrhh: [
          "registrarFichajePropio",
          "verOwnFichajes",
          "solicitudAusenciasPropio",
          "verEquipoFichajes",
          "aprobarVacacionesEquipo",
          "verEquipoVacaciones",
          "verUsuarios",
          "editarUsuariosRrhh",
          "gestionarUsuariosRrhh",
          "verFichajesTodos",
          "exportarFichajes",
          "gestionarJornadas",
          "exportarVacaciones",
        ],
      };

      const permissionCodes = PERMISSION_GROUPS[grupoPermisos] || [];

      // Borrar permisos existentes
      await prisma.userPermission.deleteMany({ where: { userId: usuarioId } });

      // Crear nuevos permisos
      for (const code of permissionCodes) {
        await prisma.userPermission.create({
          data: { userId: usuarioId, permissionCode: code },
        });
      }

      // Audit log para permisos
      await prisma.auditLog.create({
        data: {
          actor: session.user.id,
          accion: "ASIGNAR_GRUPO_PERMISOS",
          entidad: "UserPermission",
          entidadId: usuarioId,
          motivo: `Asignación a grupo "${grupoPermisos}"`,
          before: { grupoAnterior: null },
          after: { grupoNuevo: grupoPermisos },
        },
      });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return new Response("Error al actualizar usuario", { status: 500 });
  }
}
