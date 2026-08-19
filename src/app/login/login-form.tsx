"use client";

import Image from "next/image";
import { useFormStatus } from "react-dom";
import type { User } from "@/generated/prisma/client";
import { signInMicrosoft, signInDemo } from "./login-actions";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

function MicrosoftButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
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
  );
}

function DemoButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="secondary" className="w-full" disabled={pending}>
      {pending ? (
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
  );
}

export default function LoginForm({
  demoLoginHabilitado,
  usuariosDemo,
  error,
}: {
  demoLoginHabilitado: boolean;
  usuariosDemo: User[];
  error?: string;
}) {
  return (
    <div className="flex flex-1 items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-[var(--radius-card)] border border-border bg-surface p-8 shadow-sm">
        <div className="mb-8 flex items-center gap-3">
          <Logo className="max-w-[110px]" />
          <div className="h-8 w-px bg-border" />
          <Image src="/vodafone-logo.png" alt="Vodafone" width={28} height={28} />
        </div>
        <h1 className="text-xl font-bold text-foreground">Portal RRHH</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Accede con tu cuenta corporativa de Microsoft 365.
        </p>

        {error ? (
          <p className="mt-4 rounded-[var(--radius-control)] bg-danger-tint px-3 py-2 text-sm text-danger">
            No se pudo iniciar sesión. Si el problema persiste, contacta con RRHH.
          </p>
        ) : null}

        <form className="mt-6" action={signInMicrosoft}>
          <MicrosoftButton />
        </form>

        {demoLoginHabilitado ? (
          <div className="mt-6 border-t border-border pt-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Acceso de demo (solo piloto)
            </p>
            <form
              className="flex flex-col gap-2"
              action={async (formData) => {
                await signInDemo(formData.get("email") as string);
              }}
            >
              <select
                name="email"
                required
                className="rounded-[var(--radius-control)] border border-border-strong px-3 py-2 text-sm disabled:opacity-50"
              >
                {usuariosDemo.map((u) => (
                  <option key={u.id} value={u.email}>
                    {u.name} — {u.email}
                  </option>
                ))}
              </select>
              <DemoButton />
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
}
