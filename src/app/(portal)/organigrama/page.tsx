import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { OrganigramaViewer } from "@/components/organigrama/viewer";

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

  // Obtener el manager de cada usuario (para mostrar jerarquía)
  const usuariosConManager = await Promise.all(
    usuarios.map(async (u) => ({
      ...u,
      manager: u.managerId ? await prisma.user.findUnique({ where: { id: u.managerId }, select: { name: true } }) : null,
    }))
  );

  // Agrupar por departamento
  const departamentos = Array.from(new Set(usuariosConManager.map(u => u.departamento).filter((d): d is string => d !== null)));

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Organigrama" }]} />

      <Card className="p-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Organigrama de la empresa</h1>
        <p className="text-sm text-muted-foreground">Estructura jerárquica y directorio de contacto</p>
      </Card>

      <OrganigramaViewer usuarios={usuariosConManager} departamentos={departamentos} />
    </div>
  );
}
