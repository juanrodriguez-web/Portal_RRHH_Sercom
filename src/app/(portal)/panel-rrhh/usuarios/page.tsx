import { requirePermission } from "@/lib/authz";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { UsuariosForm } from "@/components/panel-rrhh/usuarios-form";
import { GestionarPermisosPanel } from "@/components/panel-rrhh/gestionar-permisos-panel";

export default async function UsuariosPage() {
  await requirePermission(PERMISSIONS.gestionarUsuariosRrhh);

  const [usuarios, jornadas] = await Promise.all([
    prisma.user.findMany({
      orderBy: { name: "asc" },
      include: {
        permisos: { select: { permissionCode: true } },
      },
    }),
    prisma.jornadaPlantilla.findMany({ orderBy: { nombre: "asc" }, select: { id: true, nombre: true } }),
  ]);
  const managers = usuarios.map((u) => ({ id: u.id, name: u.name }));

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
          <Badge tone="info">Credenciales gestionadas por Microsoft 365 (spec §9.2)</Badge>
        </div>
        <UsuariosForm usuarios={usuarios} managers={managers} jornadas={jornadas} />
      </Card>

      <Card>
        <GestionarPermisosPanel usuarios={usuarios} />
      </Card>
    </div>
  );
}
