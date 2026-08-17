import { prisma } from "@/lib/prisma";
import LoginForm from "./login-form";

const demoLoginHabilitado = process.env.AUTH_ENABLE_DEMO_LOGIN === "true";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const usuariosDemo = demoLoginHabilitado
    ? await prisma.user.findMany({
        where: { estado: "ACTIVO", email: { endsWith: "@sercomsoluciones.es" } },
        orderBy: { name: "asc" },
      })
    : [];

  return (
    <LoginForm
      demoLoginHabilitado={demoLoginHabilitado}
      usuariosDemo={usuariosDemo}
      error={error}
    />
  );
}
