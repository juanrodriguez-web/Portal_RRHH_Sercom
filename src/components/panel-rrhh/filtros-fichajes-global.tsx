"use client";

import { useRouter } from "next/navigation";

export function FiltrosFichajesGlobal({
  usuarios,
  usuarioIdSeleccionado,
  rangoSeleccionado,
}: {
  usuarios: { id: string; name: string }[];
  usuarioIdSeleccionado: string;
  rangoSeleccionado: "semana" | "mes";
}) {
  const router = useRouter();

  const actualizar = (usuarioId: string, rango: string) => {
    const params = new URLSearchParams();
    if (usuarioId) params.set("usuarioId", usuarioId);
    if (rango) params.set("rango", rango);
    router.push(`/panel-rrhh/fichajes${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={usuarioIdSeleccionado}
        onChange={(e) => actualizar(e.target.value, rangoSeleccionado)}
        className="rounded-[var(--radius-control)] border border-border-strong bg-background px-2 py-1.5 text-sm focus:ring-2 focus:ring-brand focus:outline-none"
      >
        <option value="">Todos los empleados</option>
        {usuarios.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>
      <div className="flex gap-1.5 text-sm">
        <button
          type="button"
          onClick={() => actualizar(usuarioIdSeleccionado, "semana")}
          className={`rounded-[var(--radius-control)] px-3 py-1.5 font-medium transition-colors ${
            rangoSeleccionado === "semana"
              ? "bg-brand-tint text-brand"
              : "text-muted-foreground hover:text-foreground hover:bg-background"
          }`}
        >
          Semana
        </button>
        <button
          type="button"
          onClick={() => actualizar(usuarioIdSeleccionado, "mes")}
          className={`rounded-[var(--radius-control)] px-3 py-1.5 font-medium transition-colors ${
            rangoSeleccionado === "mes"
              ? "bg-brand-tint text-brand"
              : "text-muted-foreground hover:text-foreground hover:bg-background"
          }`}
        >
          Mes
        </button>
      </div>
    </div>
  );
}
