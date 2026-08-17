import { requirePermission } from "@/lib/authz";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { FilaJornada } from "@/components/panel-rrhh/fila-jornada";
import { FormularioNuevaJornada } from "@/components/panel-rrhh/formulario-nueva-jornada";

export default async function JornadasPage() {
  await requirePermission(PERMISSIONS.gestionarJornadas);

  const jornadas = await prisma.jornadaPlantilla.findMany({
    orderBy: { nombre: "asc" },
  });

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Panel RRHH", href: "/panel-rrhh" },
          { label: "Jornadas" },
        ]}
      />
      <Card>
        <div className="mb-6">
          <h2 className="mb-4 font-bold text-foreground">Crear nueva jornada</h2>
          <FormularioNuevaJornada />
        </div>
      </Card>

      <Card>
        <div className="mb-4">
          <h2 className="font-bold text-foreground">Plantillas de jornada ({jornadas.length})</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Edita horarios o crea nuevas plantillas. RRHH asigna estas plantillas a usuarios.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-4">Nombre</th>
                <th className="py-2 pr-4">Tipo</th>
                <th className="py-2 pr-4">Horas/semana</th>
                <th className="py-2 pr-4">Inicio T1</th>
                <th className="py-2 pr-4">Fin T1</th>
                <th className="py-2 pr-4">¿Pausa?</th>
                <th className="py-2 pr-4">Inicio T2</th>
                <th className="py-2 pr-4">Fin T2</th>
                <th className="py-2 pr-4" />
              </tr>
            </thead>
            <tbody>
              {jornadas.map((j) => (
                <FilaJornada key={j.id} jornada={j} />
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
