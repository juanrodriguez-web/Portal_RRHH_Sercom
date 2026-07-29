import { requirePermission } from "@/lib/authz";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FilaUsuario } from "@/components/panel-rrhh/fila-usuario";

export default async function UsuariosPage() {
  await requirePermission(PERMISSIONS.verUsuarios);

  const usuarios = await prisma.user.findMany({ orderBy: { name: "asc" } });
  const managers = usuarios.map((u) => ({ id: u.id, name: u.name }));

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-bold text-foreground">Usuarios ({usuarios.length})</h2>
        <Badge tone="info">Alta de credenciales fuera de alcance (spec §9.2)</Badge>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="py-2 pr-4">Nombre</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Departamento</th>
              <th className="py-2 pr-4">Manager</th>
              <th className="py-2 pr-4">Estado</th>
              <th className="py-2 pr-4" />
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <FilaUsuario key={u.id} usuario={u} managers={managers} />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
