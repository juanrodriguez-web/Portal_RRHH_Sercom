import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { PermissionCode } from "@/lib/permissions";

export class AuthzError extends Error {
  constructor(message = "No autorizado") {
    super(message);
    this.name = "AuthzError";
  }
}

/**
 * Resuelve el usuario autenticado. Nunca confía en datos del cliente:
 * siempre relee la sesión del servidor.
 */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new AuthzError("Sesión no válida");
  return session.user;
}

/** Códigos de permiso del usuario, leídos en directo (nunca cacheados en el JWT). */
export async function getUserPermissionCodes(userId: string): Promise<Set<PermissionCode>> {
  const rows = await prisma.userPermission.findMany({
    where: { userId },
    select: { permissionCode: true },
  });
  return new Set(rows.map((r) => r.permissionCode as PermissionCode));
}

export async function hasPermission(userId: string, code: PermissionCode) {
  const count = await prisma.userPermission.count({
    where: { userId, permissionCode: code },
  });
  return count > 0;
}

/**
 * Toda Server Action / Route Handler que mute o lea datos sensibles debe
 * pasar por aquí. El frontend puede ocultar botones, pero la autorización
 * real vive solo en el backend (spec §4.2).
 */
export async function requirePermission(code: PermissionCode) {
  const user = await requireUser();
  const allowed = await hasPermission(user.id, code);
  if (!allowed) throw new AuthzError(`Falta el permiso: ${code}`);
  return user;
}

/**
 * Como requirePermission, pero para usar en el nivel superior de una
 * page.tsx que protege una ruta entera: en vez de lanzar (que Next.js
 * termina mostrando como un crash generico sin mensaje util, porque
 * redacta el error de render en produccion), redirige a una pantalla
 * de "sin permiso" legible. Las Server Actions siguen usando
 * requirePermission -- ahi lanzar es lo correcto, no hay pantalla que
 * mostrar y el llamador debe poder capturarlo.
 */
export async function requirePermissionOrRedirect(code: PermissionCode) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const allowed = await hasPermission(session.user.id, code);
  if (!allowed) redirect("/sin-permiso");
  return session.user;
}

/** Ids de empleados cuyo manager vigente es `managerId` (spec §4.2: ámbito equipo). */
export async function getEquipoIds(managerId: string) {
  const reportes = await prisma.user.findMany({
    where: { managerId, estado: "ACTIVO" },
    select: { id: true },
  });
  return reportes.map((r) => r.id);
}
