import { auth } from "@/lib/auth";
import { getUserPermissionCodes } from "@/lib/authz";
import { PERMISSIONS } from "@/lib/permissions";
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

  const { usuarioId } = await req.json();
  if (!usuarioId) return Response.json({ error: "Falta usuarioId." }, { status: 400 });

  if (usuarioId === session.user.id) {
    return Response.json({ error: "No puedes borrar tu propio usuario." }, { status: 400 });
  }

  const usuario = await prisma.user.findUnique({
    where: { id: usuarioId },
    include: {
      _count: {
        select: {
          marcaciones: true,
          solicitudes: true,
          comunicados: true,
          auditLogs: true,
          reportes: true,
        },
      },
    },
  });

  if (!usuario) return Response.json({ error: "Usuario no encontrado." }, { status: 404 });

  const { _count } = usuario;
  const tieneHistorial =
    _count.marcaciones > 0 ||
    _count.solicitudes > 0 ||
    _count.comunicados > 0 ||
    _count.auditLogs > 0 ||
    _count.reportes > 0;

  if (tieneHistorial) {
    return Response.json(
      {
        error:
          "No se puede borrar: tiene historial asociado (fichajes, vacaciones, comunicados o es manager de otros usuarios). Usa 'Baja' para desactivarlo en su lugar.",
      },
      { status: 409 }
    );
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Sin historial propio, pero puede tener asignación de jornada inicial (cascada) y permisos.
      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          accion: "BORRAR_USUARIO",
          entidad: "User",
          entidadId: usuario.id,
          motivo: "Baja definitiva sin historial desde Panel RRHH",
          valoresAntes: { name: usuario.name, email: usuario.email },
        },
      });
      await tx.user.delete({ where: { id: usuarioId } });
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Error borrando usuario:", error);
    return Response.json({ error: "Error al borrar el usuario." }, { status: 500 });
  }
}
