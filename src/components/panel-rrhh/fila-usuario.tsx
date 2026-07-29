"use client";

import { useState, useTransition } from "react";
import type { User } from "@/generated/prisma/client";
import { actualizarAtributosUsuario } from "@/app/(portal)/panel-rrhh/usuarios/actions";

export function FilaUsuario({
  usuario,
  managers,
}: {
  usuario: User;
  managers: { id: string; name: string }[];
}) {
  const [departamento, setDepartamento] = useState(usuario.departamento ?? "");
  const [managerId, setManagerId] = useState(usuario.managerId ?? "");
  const [estado, setEstado] = useState(usuario.estado);
  const [pending, startTransition] = useTransition();
  const [guardado, setGuardado] = useState(false);

  function guardar() {
    setGuardado(false);
    startTransition(async () => {
      await actualizarAtributosUsuario(usuario.id, {
        departamento,
        managerId: managerId || null,
        estado,
      });
      setGuardado(true);
    });
  }

  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-2 pr-4 font-medium">{usuario.name}</td>
      <td className="py-2 pr-4 text-muted-foreground">{usuario.email}</td>
      <td className="py-2 pr-4">
        <input
          value={departamento}
          onChange={(e) => setDepartamento(e.target.value)}
          className="w-32 rounded-[var(--radius-control)] border border-border-strong px-2 py-1"
        />
      </td>
      <td className="py-2 pr-4">
        <select
          value={managerId}
          onChange={(e) => setManagerId(e.target.value)}
          className="w-36 rounded-[var(--radius-control)] border border-border-strong px-2 py-1"
        >
          <option value="">—</option>
          {managers
            .filter((m) => m.id !== usuario.id)
            .map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
        </select>
      </td>
      <td className="py-2 pr-4">
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value as "ACTIVO" | "BAJA")}
          className="rounded-[var(--radius-control)] border border-border-strong px-2 py-1"
        >
          <option value="ACTIVO">Activo</option>
          <option value="BAJA">Baja</option>
        </select>
      </td>
      <td className="py-2 pr-4">
        <button
          onClick={guardar}
          disabled={pending}
          className="text-sm font-semibold text-brand hover:underline disabled:opacity-50"
        >
          {pending ? "Guardando…" : guardado ? "Guardado ✓" : "Guardar"}
        </button>
      </td>
    </tr>
  );
}
