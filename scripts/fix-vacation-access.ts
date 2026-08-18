/**
 * Script para asegurar que TODOS los usuarios puedan solicitar vacaciones.
 * Asigna permisos "empleado" y saldo de vacaciones a usuarios sin configurar.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { PERMISSION_GROUPS, PERMISSIONS } from "../src/lib/permissions";

const prisma = new PrismaClient({
  adapter: new PrismaPg(
    { connectionString: process.env.DATABASE_URL },
    { schema: process.env.DATABASE_SCHEMA || "public" }
  ),
});

const ANIO = new Date().getUTCFullYear();

async function main() {
  console.log("🔍 Verificando que TODOS los usuarios puedan solicitar vacaciones...\n");

  // Obtener todos los usuarios activos
  const usuarios = await prisma.user.findMany({
    where: { estado: "ACTIVO" },
    include: { permisos: { select: { permissionCode: true } } },
  });

  console.log(`📋 Encontrados ${usuarios.length} usuarios activos\n`);

  for (const user of usuarios) {
    console.log(`👤 ${user.name} (${user.email})`);

    // Verificar si tiene permiso solicitarVacaciones
    const tienePermiso = user.permisos.some((p) => p.permissionCode === PERMISSIONS.solicitarVacaciones);
    if (!tienePermiso) {
      console.log(`   ❌ Sin permiso solicitarVacaciones - asignando grupo "empleado"...`);
      for (const code of PERMISSION_GROUPS.empleado) {
        await prisma.userPermission.upsert({
          where: { userId_permissionCode: { userId: user.id, permissionCode: code } },
          create: { userId: user.id, permissionCode: code },
          update: {},
        });
      }
      console.log(`   ✅ Permisos asignados`);
    } else {
      console.log(`   ✅ Ya tiene permiso solicitarVacaciones`);
    }

    // Verificar si tiene saldo de vacaciones
    const saldo = await prisma.saldoVacaciones.findUnique({
      where: { userId_anio: { userId: user.id, anio: ANIO } },
    });
    if (!saldo) {
      console.log(`   ❌ Sin saldo de vacaciones - asignando 23 días...`);
      await prisma.saldoVacaciones.create({
        data: { userId: user.id, anio: ANIO, totalAnual: 23, arrastre: 0 },
      });
      console.log(`   ✅ Saldo asignado`);
    } else {
      console.log(`   ✅ Ya tiene saldo de vacaciones (${saldo.totalAnual} días)`);
    }
    console.log();
  }

  console.log("✨ Listo. TODOS los usuarios pueden solicitar vacaciones.");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
