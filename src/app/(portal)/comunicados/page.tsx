import { requireUser, getUserPermissionCodes } from "@/lib/authz";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { FormularioNuevoComunicado } from "@/components/comunicados/formulario-nuevo";
import { ListadoComunicados } from "@/components/comunicados/listado";

export default async function ComunicadosPage() {
  const user = await requireUser();
  const permisos = await getUserPermissionCodes(user.id);
  const puedeCrear = permisos.has(PERMISSIONS.crearComunicados);

  const comunicados = await prisma.comunicado.findMany({
    where: { archivado: false },
    include: { autor: { select: { name: true } } },
    orderBy: [{ importante: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-foreground">Comunicados</h1>

      {puedeCrear ? (
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-bold text-foreground">Nuevo comunicado</h2>
          <FormularioNuevoComunicado />
        </Card>
      ) : null}

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-bold text-foreground">
          Comunicados activos ({comunicados.length})
        </h2>
        <ListadoComunicados comunicados={comunicados} puedeEditar={puedeCrear} />
      </Card>
    </div>
  );
}
