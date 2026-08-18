import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { HierarchyTree } from "@/components/organigrama/hierarchy-tree";

export default async function OrganigramaPage() {
  const user = await requireUser();

  const usuarios = await prisma.user.findMany({
    where: { estado: "ACTIVO" },
    select: {
      id: true,
      name: true,
      email: true,
      departamento: true,
      managerId: true,
    },
    orderBy: { name: "asc" },
  });

  const usuarioActual = usuarios.find(u => u.id === user.id) || usuarios[0];

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Organigrama" }]} />

      <Card className="p-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Organigrama de la empresa</h1>
        <p className="text-sm text-muted-foreground">Tu posición en la jerarquía, cadena de mando y equipo</p>
      </Card>

      <HierarchyTree usuarioActual={usuarioActual} todos={usuarios} />
    </div>
  );
}
