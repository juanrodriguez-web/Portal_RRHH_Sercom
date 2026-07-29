export { auth as proxy } from "@/lib/auth";

// Protege todo el portal salvo login, el propio flujo de Auth.js y assets
// estáticos. Next.js 16 ejecuta `proxy` en runtime nodejs (no edge), lo que
// aquí es una ventaja: `auth()` consulta Prisma/Postgres para resolver
// permisos y eso no es compatible con edge.
export const config = {
  matcher: ["/((?!api/auth|login|_next/static|_next/image|favicon.ico|icons|manifest.webmanifest|sw.js).*)"],
};
