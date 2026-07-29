import ExcelJS from "exceljs";
import { requireUser, getUserPermissionCodes, getEquipoIds } from "@/lib/authz";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await requireUser();
  const permisos = await getUserPermissionCodes(user.id);

  const puedeGlobal = permisos.has(PERMISSIONS.verVacacionesGlobal);
  const puedeEquipo = permisos.has(PERMISSIONS.verVacacionesEquipo);
  if (!puedeGlobal && !puedeEquipo) {
    return new Response("No autorizado", { status: 403 });
  }

  const userIds = puedeGlobal ? undefined : await getEquipoIds(user.id);

  const solicitudes = await prisma.solicitudAusencia.findMany({
    where: { userId: userIds ? { in: userIds } : undefined },
    include: { user: true, aprobador: true },
    orderBy: { fechaInicio: "desc" },
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Vacaciones");
  sheet.addRow([`Generado: ${new Date().toISOString()}`]);
  sheet.addRow([]);
  sheet.addRow(["Empleado", "Tipo", "Fecha inicio", "Fecha fin", "Días", "Estado", "Aprobador"]);

  for (const s of solicitudes) {
    sheet.addRow([
      s.user.name,
      s.tipoAusenciaCodigo,
      s.fechaInicio.toISOString().slice(0, 10),
      s.fechaFin.toISOString().slice(0, 10),
      s.dias,
      s.estado,
      s.aprobador?.name ?? "",
    ]);
  }

  sheet.columns.forEach((col) => (col.width = 16));

  const buffer = await workbook.xlsx.writeBuffer();
  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="vacaciones_${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}
