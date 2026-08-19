"use server";

import { prisma } from "@/lib/prisma";

export type OrgChartUser = {
  id: string;
  name: string;
  departamento: string | null;
  reportes: OrgChartUser[];
};

export async function obtenerEstructuraOrganizacional(): Promise<OrgChartUser[]> {
  // Obtener solo usuarios que son jefes (tienen reportes)
  const usuarios = await prisma.user.findMany({
    where: {
      estado: "ACTIVO",
    },
    select: {
      id: true,
      name: true,
      departamento: true,
      managerId: true,
      reportes: {
        select: {
          id: true,
          name: true,
          departamento: true,
          reportes: {
            select: {
              id: true,
              name: true,
              departamento: true,
              reportes: true,
            },
          },
        },
      },
    },
  });

  // Retornar solo usuarios sin manager (raíz del árbol)
  return usuarios.filter((u) => !u.managerId) as OrgChartUser[];
}
