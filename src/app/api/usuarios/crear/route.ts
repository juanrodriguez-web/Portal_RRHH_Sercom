import { auth } from "@/lib/auth";
import { getUserPermissionCodes } from "@/lib/authz";
import { PERMISSIONS, PERMISSION_GROUPS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const DOMINIO_PERMITIDO = "@sercomsoluciones.es";

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

  const body = await req.json();
  const { name, email: emailRaw, departamento, managerId, jornadaId, grupoPermisos } = body;

  const name_ = String(name ?? "").trim();
  const email = String(emailRaw ?? "").trim().toLowerCase();

  if (!name_) {
    return Response.json({ error: "El nombre es obligatorio." }, { status: 400 });
  }
  if (!email.endsWith(DOMINIO_PERMITIDO)) {
    return Response.json(
      { error: `El email debe pertenecer al dominio ${DOMINIO_PERMITIDO} (spec §9.2: la identidad viene de Microsoft 365).` },
      { status: 400 }
    );
  }
  if (!jornadaId) {
    return Response.json({ error: "Selecciona una jornada." }, { status: 400 });
  }

  const existente = await prisma.user.findUnique({ where: { email } });
  if (existente) {
    return Response.json({ error: "Ya existe un usuario con ese email." }, { status: 409 });
  }

  const jornada = await prisma.jornadaPlantilla.findUnique({ where: { id: jornadaId } });
  if (!jornada) {
    return Response.json({ error: "La jornada seleccionada no existe." }, { status: 400 });
  }

  const grupo = grupoPermisos && PERMISSION_GROUPS[grupoPermisos] ? grupoPermisos : "empleado";

  try {
    const nuevoUsuario = await prisma.$transaction(async (tx) => {
      const usuario = await tx.user.create({
        data: {
          name: name_,
          email,
          departamento: departamento || null,
          managerId: managerId || null,
          estado: "ACTIVO",
        },
      });

      for (const code of PERMISSION_GROUPS[grupo]) {
        await tx.userPermission.create({ data: { userId: usuario.id, permissionCode: code } });
      }

      await tx.asignacionJornada.create({
        data: { userId: usuario.id, jornadaId, vigenteDesde: new Date() },
      });

      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          accion: "CREAR_USUARIO",
          entidad: "User",
          entidadId: usuario.id,
          motivo: "Alta de empleado desde Panel RRHH",
          valoresDespues: { name: usuario.name, email: usuario.email, departamento, managerId, grupoPermisos: grupo },
        },
      });

      return usuario;
    });

    return Response.json({ ok: true, usuario: nuevoUsuario }, { status: 201 });
  } catch (error) {
    console.error("Error creando usuario:", error);
    return Response.json({ error: "Error al crear el usuario." }, { status: 500 });
  }
}
