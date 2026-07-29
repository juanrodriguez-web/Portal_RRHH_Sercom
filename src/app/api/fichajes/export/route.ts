import ExcelJS from "exceljs";
import { requireUser, getUserPermissionCodes, getEquipoIds } from "@/lib/authz";
import { PERMISSIONS } from "@/lib/permissions";
import { getHistoricoUsuario } from "@/lib/fichajes";
import { prisma } from "@/lib/prisma";
import { formatHora } from "@/lib/format";

export async function GET() {
  const user = await requireUser();
  const permisos = await getUserPermissionCodes(user.id);
  if (!permisos.has(PERMISSIONS.exportarFichajes)) {
    return new Response("No autorizado", { status: 403 });
  }

  let usuarios: { id: string; name: string }[];
  if (permisos.has(PERMISSIONS.verFichajeGlobal)) {
    usuarios = await prisma.user.findMany({ where: { estado: "ACTIVO" }, select: { id: true, name: true } });
  } else if (permisos.has(PERMISSIONS.verFichajeEquipo)) {
    const ids = await getEquipoIds(user.id);
    usuarios = await prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } });
  } else {
    usuarios = [{ id: user.id, name: user.name ?? user.email ?? "" }];
  }

  const hasta = new Date();
  const desde = new Date(hasta.getTime() - 30 * 86_400_000);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Fichajes");
  sheet.addRow([`Generado: ${new Date().toISOString()}`, `Filtro: últimos 30 días`]);
  sheet.addRow([]);
  sheet.addRow(["Empleado", "Fecha", "E. mañana", "S. mañana", "E. tarde", "S. tarde", "Total (min)", "Estado", "Corregida"]);

  for (const u of usuarios) {
    const filas = await getHistoricoUsuario(u.id, desde, hasta, u.name);
    for (const f of filas) {
      sheet.addRow([
        u.name,
        f.fecha.toISOString().slice(0, 10),
        formatHora(f.entradaManana),
        formatHora(f.salidaManana),
        formatHora(f.entradaTarde),
        formatHora(f.salidaTarde),
        f.totalMinutos,
        f.estado,
        f.corregida ? "Sí" : "No",
      ]);
    }
  }

  sheet.columns.forEach((col) => (col.width = 16));

  const buffer = await workbook.xlsx.writeBuffer();
  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="fichajes_${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}
