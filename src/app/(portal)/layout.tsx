import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserPermissionCodes } from "@/lib/authz";
import { PERMISSIONS } from "@/lib/permissions";
import { Sidebar, type NavItem } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { ClockIcon, HomeIcon, CalendarIcon, ShieldIcon, BellIcon } from "@/components/ui/icons";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const permisos = await getUserPermissionCodes(session.user.id);

  const general: NavItem[] = [{ href: "/inicio", label: "Inicio", icon: <HomeIcon /> }];
  if (permisos.has(PERMISSIONS.verFichajePropio)) {
    general.push({ href: "/fichajes", label: "Fichajes", icon: <ClockIcon /> });
  }
  if (permisos.has(PERMISSIONS.solicitarVacaciones) || permisos.has(PERMISSIONS.verVacacionesGlobal)) {
    general.push({ href: "/vacaciones", label: "Vacaciones", icon: <CalendarIcon /> });
  }
  if (permisos.has(PERMISSIONS.verComunicados)) {
    general.push({ href: "/comunicados", label: "Comunicados", icon: <BellIcon /> });
  }

  const rrhh: NavItem[] = [];
  if (permisos.has(PERMISSIONS.verUsuarios) || permisos.has(PERMISSIONS.verFichajeGlobal)) {
    rrhh.push({ href: "/panel-rrhh", label: "Panel RRHH", icon: <ShieldIcon /> });
  }

  const userInitials = (session.user.name ?? session.user.email ?? "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar general={general} rrhh={rrhh} />
      <div className="flex flex-1 flex-col">
        <Topbar
          title="Portal RRHH"
          userName={session.user.name ?? session.user.email ?? ""}
          userInitials={userInitials}
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
