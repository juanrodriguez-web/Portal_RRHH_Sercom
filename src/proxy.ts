export { auth as proxy } from "@/lib/auth";

// Protege todo el portal salvo login, el propio flujo de Auth.js y assets
// estáticos. Next.js 16 ejecuta `proxy` en runtime nodejs (no edge), lo que
// aquí es una ventaja: `auth()` consulta Prisma/Postgres para resolver
// permisos y eso no es compatible con edge.
//
// El patrón de extensiones cubre archivos sueltos servidos directo desde
// /public (logos, íconos, etc.) -- sin esto, cualquier visitante SIN sesión
// (p. ej. en /login, donde por definición nadie está logueado todavía)
// recibía el HTML de /login en vez de la imagen al pedir /logo-sercom.png,
// dejando el logo roto justo donde más se necesita.
export const config = {
  matcher: [
    "/((?!api/auth|login|_next/static|_next/image|favicon.ico|icons|manifest.webmanifest|sw.js|.*\\.(?:png|jpg|jpeg|svg|webp|gif|ico|woff2?|ttf)$).*)",
  ],
};
