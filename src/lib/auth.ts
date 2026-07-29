import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

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
    // Solo pueden entrar usuarios ya dados de alta por RRHH en el piloto
    // (spec §9.2: la fuente de identidad es el usuario existente, no un
    // alta automática por login).
    async signIn({ user }) {
      if (!user.email) return false;
      const existing = await prisma.user.findUnique({
        where: { email: user.email.toLowerCase() },
        select: { estado: true },
      });
      return existing?.estado === "ACTIVO";
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
