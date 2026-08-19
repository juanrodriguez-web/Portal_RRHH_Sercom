import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserPermissionCodes } from "@/lib/authz";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { PortalShell, type NavItem } from "@/components/layout/portal-shell";
import { ClockIcon, HomeIcon, CalendarIcon, ShieldIcon, UsersIcon } from "@/components/ui/icons";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [permisos, dbUser] = await Promise.all([
    getUserPermissionCodes(session.user.id),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { departamento: true } }),
  ]);

  const general: NavItem[] = [{ href: "/inicio", label: "Inicio", icon: <HomeIcon /> }];
  if (permisos.has(PERMISSIONS.verFichajePropio)) {
    general.push({ href: "/fichajes", label: "Fichajes", icon: <ClockIcon /> });
  }
  if (permisos.has(PERMISSIONS.solicitarVacaciones) || permisos.has(PERMISSIONS.verVacacionesGlobal)) {
    general.push({ href: "/vacaciones", label: "Vacaciones", icon: <CalendarIcon /> });
  }
  if (permisos.has(PERMISSIONS.verUsuarios)) {
    general.push({ href: "/organigrama", label: "Organigrama", icon: <UsersIcon /> });
  }

  const rrhh: NavItem[] = [];
  if (permisos.has(PERMISSIONS.gestionarUsuariosRrhh)) {
    rrhh.push({ href: "/panel-rrhh", label: "Panel RRHH", icon: <ShieldIcon /> });
  }

  const userInitials = (session.user.name ?? session.user.email ?? "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <PortalShell
      general={general}
      rrhh={rrhh}
      title="Portal RRHH"
      userName={session.user.name ?? session.user.email ?? ""}
      userInitials={userInitials}
      userDepartamento={dbUser?.departamento ?? null}
    >
      {children}
    </PortalShell>
  );
}
