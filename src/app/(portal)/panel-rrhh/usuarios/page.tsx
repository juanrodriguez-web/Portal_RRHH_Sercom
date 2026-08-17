import { requirePermission } from "@/lib/authz";
import { PERMISSIONS, PERMISSION_GROUPS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { FilaUsuario } from "@/components/panel-rrhh/fila-usuario";
import { UsuariosForm } from "@/components/panel-rrhh/usuarios-form";

export default async function UsuariosPage() {
  await requirePermission(PERMISSIONS.verUsuarios);

  const usuarios = await prisma.user.findMany({
    orderBy: { name: "asc" },
    include: {
      permisos: { select: { permissionCode: true } },
    },
  });
  const managers = usuarios.map((u) => ({ id: u.id, name: u.name }));

  return (
    <div className="space-y-4">
      <Breadcrumb
        items={[
          { label: "Panel RRHH", href: "/panel-rrhh" },
          { label: "Usuarios" },
        ]}
      />

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-foreground">Usuarios ({usuarios.length})</h2>
          <Badge tone="info">Alta de credenciales fuera de alcance (spec §9.2)</Badge>
        </div>
        <UsuariosForm usuarios={usuarios} managers={managers} />
      </Card>
    </div>
  );
}
