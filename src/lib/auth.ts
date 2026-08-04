import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { PERMISSION_GROUPS } from "@/lib/permissions";

// Acceso de demo — igual de espíritu que el selector "Simular acceso como"
// del prototipo (Anexo C: "exclusivamente demostrativo"). Permite entrar
// como cualquier usuario semilla por email, SIN contraseña, mientras no
// esté configurado el App Registration de Entra ID. Nunca debe activarse
// en el despliegue real (por eso requiere la variable explícita).
const demoLoginHabilitado = process.env.AUTH_ENABLE_DEMO_LOGIN === "true";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    MicrosoftEntraID,
    ...(demoLoginHabilitado
      ? [
          Credentials({
            id: "demo",
            name: "Demo",
            credentials: { email: { label: "Email", type: "text" } },
            async authorize(credentials) {
              const email = String(credentials?.email ?? "").toLowerCase();
              const user = await prisma.user.findUnique({ where: { email } });
              if (!user || user.estado !== "ACTIVO") return null;
              return { id: user.id, email: user.email, name: user.name };
            },
          }),
        ]
      : []),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    // Usado por src/proxy.ts para proteger rutas: sin sesión -> redirige a /login.
    authorized({ auth }) {
      return !!auth?.user;
    },
    // Auto-crea usuarios de @sercomsoluciones.es, rechaza el resto
    // (spec §9.2: la fuente de identidad es Microsoft 365).
    // En el primer login, asigna automáticamente:
    //   - Permisos de grupo "empleado"
    //   - Jornada predeterminada: "Oficina — jornada partida" (40 horas/semana)
    //   - RRHH puede cambiar ambos después si es necesario
    async signIn({ user }) {
      if (!user.email) return false;
      const email = user.email.toLowerCase();
      const existing = await prisma.user.findUnique({
        where: { email },
        select: { id: true, estado: true },
      });
      if (existing) return existing.estado === "ACTIVO";

      // Si no existe: crear solo si es dominio @sercomsoluciones.es
      if (!email.endsWith("@sercomsoluciones.es")) return false;
      try {
        await prisma.$transaction(async (tx) => {
          // Crear usuario
          const newUser = await tx.user.create({
            data: { email, name: user.name || email, estado: "ACTIVO" },
          });

          // Asignar permisos de grupo "empleado"
          const empleadoPermisos = PERMISSION_GROUPS["empleado"];
          for (const permCode of empleadoPermisos) {
            await tx.userPermission.create({
              data: { userId: newUser.id, permissionCode: permCode },
            });
          }

          // Asignar jornada predeterminada: "Jornada partida — 37.5 horas/semana"
          // vigente desde hoy
          await tx.asignacionJornada.create({
            data: {
              userId: newUser.id,
              jornadaId: "seed-jornada-37.5h",
              vigenteDesde: new Date(),
            },
          });
        });
        return true;
      } catch {
        return false;
      }
    },
    async jwt({ token }) {
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email.toLowerCase() },
          select: { id: true },
        });
        if (dbUser) token.userId = dbUser.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.userId) session.user.id = token.userId as string;
      return session;
    },
  },
});
