import { requirePermissionOrRedirect } from "@/lib/authz";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { UsuariosForm } from "@/components/panel-rrhh/usuarios-form";
import { GestionarPermisosPanel } from "@/components/panel-rrhh/gestionar-permisos-panel";

export default async function UsuariosPage() {
  await requirePermissionOrRedirect(PERMISSIONS.gestionarUsuariosRrhh);

  const [usuarios, jornadas, asignacionesVigentes] = await Promise.all([
    prisma.user.findMany({
      orderBy: { name: "asc" },
      include: {
        permisos: { select: { permissionCode: true } },
      },
    }),
    prisma.jornadaPlantilla.findMany({ orderBy: { nombre: "asc" }, select: { id: true, nombre: true } }),
    prisma.asignacionJornada.findMany({
      where: { vigenteHasta: null },
      select: { userId: true, jornadaId: true },
    }),
  ]);
  const managers = usuarios.map((u) => ({ id: u.id, name: u.name }));
  const jornadaActualPorUsuario = Object.fromEntries(
    asignacionesVigentes.map((a) => [a.userId, a.jornadaId])
  );

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Panel RRHH", href: "/panel-rrhh" },
          { label: "Usuarios" },
        ]}
      />

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-foreground">Gestionar empleados</h2>
          <Badge tone="info">Credenciales gestionadas por Microsoft 365</Badge>
        </div>
        <UsuariosForm
          usuarios={usuarios}
          managers={managers}
          jornadas={jornadas}
          jornadaActualPorUsuario={jornadaActualPorUsuario}
        />
      </Card>

      <Card>
        <GestionarPermisosPanel usuarios={usuarios} />
      </Card>
    </div>
  );
}
