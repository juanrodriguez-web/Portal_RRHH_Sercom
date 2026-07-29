import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

const demoLoginHabilitado = process.env.AUTH_ENABLE_DEMO_LOGIN === "true";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const usuariosDemo = demoLoginHabilitado
    ? await prisma.user.findMany({ where: { estado: "ACTIVO" }, orderBy: { name: "asc" } })
    : [];

  return (
    <div className="flex flex-1 items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-[var(--radius-card)] border border-border bg-surface p-8 shadow-sm">
        <Logo className="mb-8" />
        <h1 className="text-xl font-bold text-foreground">Portal RRHH</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Accede con tu cuenta corporativa de Microsoft 365.
        </p>

        {error ? (
          <p className="mt-4 rounded-[var(--radius-control)] bg-danger-tint px-3 py-2 text-sm text-danger">
            No se pudo iniciar sesión. Si el problema persiste, contacta con RRHH.
          </p>
        ) : null}

        <form
          className="mt-6"
          action={async () => {
            "use server";
            await signIn("microsoft-entra-id", { redirectTo: "/inicio" });
          }}
        >
          <Button type="submit" className="w-full">
            Iniciar sesión con Microsoft
          </Button>
        </form>

        {demoLoginHabilitado ? (
          <div className="mt-6 border-t border-border pt-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Acceso de demo (solo piloto)
            </p>
            <form
              className="flex flex-col gap-2"
              action={async (formData) => {
                "use server";
                await signIn("demo", { email: formData.get("email"), redirectTo: "/inicio" });
              }}
            >
              <select
                name="email"
                required
                className="rounded-[var(--radius-control)] border border-border-strong px-3 py-2 text-sm"
              >
                {usuariosDemo.map((u) => (
                  <option key={u.id} value={u.email}>
                    {u.name} — {u.email}
                  </option>
                ))}
              </select>
              <Button type="submit" variant="secondary" className="w-full">
                Entrar como demo
              </Button>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
}
