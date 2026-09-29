import { requirePermissionOrRedirect } from "@/lib/authz";
import { PERMISSIONS } from "@/lib/permissions";
import { getHistoricoGlobal, getHistoricoUsuario } from "@/lib/fichajes";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { HistoricoTable } from "@/components/fichajes/historico-table";
import { FiltrosFichajesGlobal } from "@/components/panel-rrhh/filtros-fichajes-global";

export const dynamic = "force-dynamic";

function rangoFechas(rango: "semana" | "mes") {
  const hasta = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()));
  const desde = new Date(hasta);
  desde.setUTCDate(desde.getUTCDate() - (rango === "mes" ? 30 : 6));
  return { desde, hasta };
}

export default async function FichajesGlobalPage({
  searchParams,
}: {
  searchParams: Promise<{ rango?: string; usuarioId?: string }>;
}) {
  await requirePermissionOrRedirect(PERMISSIONS.verFichajeGlobal);

  const { rango, usuarioId } = await searchParams;
  const rangoSeleccionado = rango === "mes" ? "mes" : "semana";
  const { desde, hasta } = rangoFechas(rangoSeleccionado);

  const usuarios = await prisma.user.findMany({
    where: { estado: "ACTIVO" },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const historico = usuarioId
    ? await getHistoricoUsuario(usuarioId, desde, hasta, usuarios.find((u) => u.id === usuarioId)?.name)
    : await getHistoricoGlobal(desde, hasta);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Panel RRHH", href: "/panel-rrhh" },
          { label: "Fichajes" },
        ]}
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-bold text-foreground">Consulta global de fichajes</h2>
          <a
            href="/api/fichajes/export"
            className="w-fit rounded-[var(--radius-control)] border border-border-strong px-3 py-1.5 text-sm font-semibold hover:bg-background"
          >
            Excel
          </a>
        </div>

        <FiltrosFichajesGlobal
          usuarios={usuarios}
          usuarioIdSeleccionado={usuarioId ?? ""}
          rangoSeleccionado={rangoSeleccionado}
        />

        <div className="mt-4">
          <HistoricoTable filas={historico} mostrarEmpleado={!usuarioId} />
        </div>
      </Card>
    </div>
  );
}
