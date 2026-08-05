import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./src/generated/prisma/client";

const adapter = new PrismaPg(
  { connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL },
  { schema: process.env.DATABASE_SCHEMA || "portal_rrhh" }
);
const prisma = new PrismaClient({ adapter });

async function deleteFichajesDeHoy() {
  // Primero listar usuarios
  const users = await prisma.user.findMany();
  console.log("Usuarios disponibles:");
  users.forEach((u) => console.log(`  - ${u.name} (${u.email})`));

  const email = users.find((u) => u.name.includes("Juan"))?.email || users[0]?.email;
  if (!email) {
    console.log("No hay usuarios");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log("Usuario no encontrado");
    process.exit(1);
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const deleted = await prisma.marcacion.deleteMany({
    where: {
      userId: user.id,
      fechaLaboral: hoy,
    },
  });

  console.log(`✓ Borrados ${deleted.count} fichajes de hoy para ${user.name}`);
  await prisma.$disconnect();
  process.exit(0);
}

deleteFichajesDeHoy().catch((e) => {
  console.error(e);
  process.exit(1);
});
