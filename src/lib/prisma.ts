import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // El `?schema=` de la connection string solo lo respeta el motor de
  // migraciones; el pool de `pg` en runtime necesita el schema explícito
  // aquí para apuntar al mismo sitio (ver DATABASE_SCHEMA en .env — por
  // defecto "public", pero aislado en "portal_rrhh" cuando se comparte un
  // proyecto Supabase con otras apps).
  const adapter = new PrismaPg(
    { connectionString: process.env.DATABASE_URL },
    { schema: process.env.DATABASE_SCHEMA || "public" }
  );
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
