"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/authz";
import { PERMISSIONS } from "@/lib/permissions";

export type OrgNode = {
  id: string;
  name: string;
  email: string;
  departamento: string | null;
  managerId: string | null;
  manager: { id: string; name: string; email: string; departamento: string | null } | null;
  reportes: { id: string; name: string; email: string; departamento: string | null }[];
};

export async function obtenerMiOrganigrama(): Promise<OrgNode> {
  const user = await requirePermission(PERMISSIONS.fichajePropio);

  const miInfo = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      departamento: true,
      managerId: true,
      manager: {
        select: {
          id: true,
          name: true,
          email: true,
          departamento: true,
        },
      },
      reportes: {
        select: {
          id: true,
          name: true,
          email: true,
          departamento: true,
        },
        orderBy: { name: "asc" },
      },
    },
  });

  return miInfo as OrgNode;
}

export async function obtenerNivelSuperior(userId: string): Promise<OrgNode | null> {
  await requirePermission(PERMISSIONS.fichajePropio);

  const usuario = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      manager: {
        select: {
          id: true,
          name: true,
          email: true,
          departamento: true,
          managerId: true,
          manager: {
            select: {
              id: true,
              name: true,
              email: true,
              departamento: true,
            },
          },
          reportes: {
            select: {
              id: true,
              name: true,
              email: true,
              departamento: true,
            },
            orderBy: { name: "asc" },
          },
        },
      },
    },
  });

  return usuario?.manager as OrgNode | null;
}
