"use client";

import { useTransition } from "react";
import { signIn } from "@/lib/auth";
import type { User } from "@/generated/prisma/client";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

export default function LoginForm({
  demoLoginHabilitado,
  usuariosDemo,
  error,
}: {
  demoLoginHabilitado: boolean;
  usuariosDemo: User[];
  error?: string;
}) {
  const [pendingMicrosoft, startMicrosoft] = useTransition();
  const [pendingDemo, startDemo] = useTransition();

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
            await signIn("microsoft-entra-id", { redirectTo: "/inicio" });
          }}
        >
          <Button
            type="submit"
            className="w-full"
            disabled={pendingMicrosoft || pendingDemo}
            onClick={() => startMicrosoft(async () => {})}
          >
            {pendingMicrosoft ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Cargando…
              </span>
            ) : (
              "Iniciar sesión con Microsoft"
            )}
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
                await signIn("demo", {
                  email: formData.get("email"),
                  redirectTo: "/inicio",
                });
              }}
            >
              <select
                name="email"
                required
                disabled={pendingDemo || pendingMicrosoft}
                className="rounded-[var(--radius-control)] border border-border-strong px-3 py-2 text-sm disabled:opacity-50"
              >
                {usuariosDemo.map((u) => (
                  <option key={u.id} value={u.email}>
                    {u.name} — {u.email}
                  </option>
                ))}
              </select>
              <Button
                type="submit"
                variant="secondary"
                className="w-full"
                disabled={pendingDemo || pendingMicrosoft}
                onClick={() => startDemo(async () => {})}
              >
                {pendingDemo ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin text-brand"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Cargando…
                  </span>
                ) : (
                  "Entrar como demo"
                )}
              </Button>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
}
