"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Jornada = { id: string; nombre: string };
type Manager = { id: string; name: string };

export function NuevoUsuarioModal({
  jornadas,
  managers,
  onClose,
}: {
  jornadas: Jornada[];
  managers: Manager[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const jornadaDefault = jornadas.find((j) => j.id === "seed-jornada-37.5h")?.id ?? jornadas[0]?.id ?? "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto p-6">
        <div>
          <h2 className="text-lg font-bold text-foreground">Alta de empleado</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Crea el registro RRHH antes de su primer inicio de sesión. Las credenciales las gestiona Microsoft 365
            (spec §9.2) — al iniciar sesión por primera vez con este email, se vinculará automáticamente a esta ficha.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            const formData = new FormData(e.currentTarget);
            const body = {
              name: formData.get("name"),
              email: formData.get("email"),
              departamento: formData.get("departamento"),
              managerId: formData.get("managerId") || null,
              jornadaId: formData.get("jornadaId"),
              grupoPermisos: formData.get("grupoPermisos"),
            };

            setSaving(true);
            fetch("/api/usuarios/crear", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            })
              .then(async (res) => {
                const data = await res.json();
                if (!res.ok) {
                  setError(data.error || "Error al crear el usuario.");
                  return;
                }
                router.refresh();
                onClose();
              })
              .catch(() => setError("Error al crear el usuario."))
              .finally(() => setSaving(false));
          }}
          className="space-y-4"
        >
          <div>
            <label className="text-sm font-medium">Nombre completo</label>
            <input
              type="text"
              name="name"
              required
              maxLength={120}
              className="mt-1 w-full rounded border border-border bg-background p-2 text-sm"
              disabled={saving}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Email corporativo</label>
            <input
              type="email"
              name="email"
              required
              placeholder="nombre.apellido@sercomsoluciones.es"
              className="mt-1 w-full rounded border border-border bg-background p-2 text-sm"
              disabled={saving}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Departamento</label>
              <input
                type="text"
                name="departamento"
                className="mt-1 w-full rounded border border-border bg-background p-2 text-sm"
                disabled={saving}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Manager</label>
              <select
                name="managerId"
                className="mt-1 w-full rounded border border-border bg-background p-2 text-sm"
                disabled={saving}
              >
                <option value="">—</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Jornada</label>
              <select
                name="jornadaId"
                required
                defaultValue={jornadaDefault}
                className="mt-1 w-full rounded border border-border bg-background p-2 text-sm"
                disabled={saving}
              >
                {jornadas.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Grupo de permisos</label>
              <select
                name="grupoPermisos"
                defaultValue="empleado"
                className="mt-1 w-full rounded border border-border bg-background p-2 text-sm"
                disabled={saving}
              >
                <option value="empleado">Empleado</option>
                <option value="manager">Manager</option>
                <option value="rrhh">RRHH</option>
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Creando..." : "Crear empleado"}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
