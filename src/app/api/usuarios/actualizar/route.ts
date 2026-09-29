import { auth } from "@/lib/auth";
import { getUserPermissionCodes } from "@/lib/authz";
import { PERMISSIONS, PERMISSION_GROUPS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  try {
    const permisos = await getUserPermissionCodes(session.user.id);
    if (!permisos.has(PERMISSIONS.gestionarUsuariosRrhh)) {
      return new Response("Forbidden", { status: 403 });
    }
  } catch {
    return new Response("Forbidden", { status: 403 });
  }

  const actorId = session.user.id;

  const body = await req.json();
  const { usuarioId, name, email: emailRaw, departamento, managerId, estado, grupoPermisos, jornadaId } = body;

  if (!usuarioId) {
    return new Response("Missing usuarioId", { status: 400 });
  }

  const DOMINIO_PERMITIDO = "@sercomsoluciones.es";
  let email: string | undefined;
  if (emailRaw !== undefined) {
    email = String(emailRaw).trim().toLowerCase();
    if (!email.endsWith(DOMINIO_PERMITIDO)) {
      return Response.json(
        { error: `El email debe pertenecer al dominio ${DOMINIO_PERMITIDO}.` },
        { status: 400 }
      );
    }
  }
  if (name !== undefined && String(name).trim() === "") {
    return Response.json({ error: "El nombre no puede estar vacío." }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: usuarioId } });
    if (!user) {
      return new Response("Usuario no encontrado", { status: 404 });
    }

    if (email !== undefined && email !== user.email) {
      const existente = await prisma.user.findUnique({ where: { email } });
      if (existente) {
        return Response.json({ error: "Ya existe otro usuario con ese email." }, { status: 409 });
      }
    }

    // Actualizar atributos básicos
    if (
      name !== undefined ||
      email !== undefined ||
      departamento !== undefined ||
      managerId !== undefined ||
      estado !== undefined
    ) {
      await prisma.user.update({
        where: { id: usuarioId },
        data: {
          ...(name !== undefined && { name: String(name).trim() }),
          ...(email !== undefined && { email }),
          ...(departamento !== undefined && { departamento }),
          ...(managerId !== undefined && { managerId }),
          ...(estado !== undefined && {
            estado,
            fechaBaja: estado === "BAJA" ? (user.fechaBaja ?? new Date()) : null,
          }),
        },
      });

      // Audit log
      await prisma.auditLog.create({
        data: {
          actorId: session.user.id,
          accion: "ACTUALIZAR_USUARIO",
          entidad: "User",
          entidadId: usuarioId,
          motivo: "Actualización de atributos RRHH",
          valoresAntes: {
            name: user.name,
            email: user.email,
            departamento: user.departamento,
            managerId: user.managerId,
            estado: user.estado,
          },
          valoresDespues: {
            name: name !== undefined ? String(name).trim() : user.name,
            email: email ?? user.email,
            departamento: departamento ?? user.departamento,
            managerId: managerId ?? user.managerId,
            estado: estado ?? user.estado,
          },
        },
      });
    }

    // Asignar grupo de permisos si se envía
    if (grupoPermisos && grupoPermisos !== "") {
      const permissionCodes = PERMISSION_GROUPS[grupoPermisos as keyof typeof PERMISSION_GROUPS] || [];

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
          actorId: session.user.id,
          accion: "ASIGNAR_GRUPO_PERMISOS",
          entidad: "UserPermission",
          entidadId: usuarioId,
          motivo: `Asignación a grupo "${grupoPermisos}"`,
          valoresDespues: { grupoNuevo: grupoPermisos },
        },
      });
    }

    // Reasignar jornada: cierra la asignación vigente y abre una nueva (spec §6.1 — histórico de jornadas por rango de fechas)
    if (jornadaId !== undefined) {
      const asignacionVigente = await prisma.asignacionJornada.findFirst({
        where: { userId: usuarioId, vigenteHasta: null },
      });

      if (asignacionVigente?.jornadaId !== jornadaId) {
        const ahora = new Date();

        await prisma.$transaction(async (tx) => {
          if (asignacionVigente) {
            await tx.asignacionJornada.update({
              where: { id: asignacionVigente.id },
              data: { vigenteHasta: ahora },
            });
          }

          if (jornadaId) {
            await tx.asignacionJornada.create({
              data: { userId: usuarioId, jornadaId, vigenteDesde: ahora },
            });
          }

          await tx.auditLog.create({
            data: {
              actorId,
              accion: "REASIGNAR_JORNADA",
              entidad: "AsignacionJornada",
              entidadId: usuarioId,
              motivo: "Reasignación de jornada desde ficha de Usuarios",
              valoresAntes: { jornadaId: asignacionVigente?.jornadaId ?? null },
              valoresDespues: { jornadaId: jornadaId || null },
            },
          });
        });
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return new Response("Error al actualizar usuario", { status: 500 });
  }
}
