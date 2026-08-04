"use client";

import { useState, useTransition } from "react";
import type { User } from "@/generated/prisma/client";
import { PERMISSION_GROUPS } from "@/lib/permissions";
import { actualizarAtributosUsuario, asignarGrupoPermisos } from "@/app/(portal)/panel-rrhh/usuarios/actions";

type UsuarioConPermisos = User & {
  permisos: { permissionCode: string }[];
};

export function FilaUsuario({
  usuario,
  managers,
}: {
  usuario: UsuarioConPermisos;
  managers: { id: string; name: string }[];
}) {
  const [departamento, setDepartamento] = useState(usuario.departamento ?? "");
  const [managerId, setManagerId] = useState(usuario.managerId ?? "");
  const [estado, setEstado] = useState(usuario.estado);
  const [grupoPermisos, setGrupoPermisos] = useState<"empleado" | "manager" | "rrhh" | "">(
    usuario.permisos.length > 0 ? detectarGrupo(usuario.permisos) : ""
  );
  const [pending, startTransition] = useTransition();
  const [guardado, setGuardado] = useState(false);

  function detectarGrupo(permisos: { permissionCode: string }[]): "empleado" | "manager" | "rrhh" | "" {
    const codes = new Set(permisos.map((p) => p.permissionCode));
    if (codes.has("gestionarUsuariosRrhh")) return "rrhh";
    if (codes.has("aprobarVacacionesEquipo")) return "manager";
    if (codes.has("registrarFichajePropio")) return "empleado";
    return "";
  }

  function guardar() {
    setGuardado(false);
    startTransition(async () => {
      await actualizarAtributosUsuario(usuario.id, {
        departamento,
        managerId: managerId || null,
        estado,
      });
      if (grupoPermisos) {
        await asignarGrupoPermisos(usuario.id, grupoPermisos as "empleado" | "manager" | "rrhh");
      }
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
        <select
          value={grupoPermisos}
          onChange={(e) => setGrupoPermisos(e.target.value as any)}
          className="rounded-[var(--radius-control)] border border-border-strong px-2 py-1 text-sm"
        >
          <option value="">—</option>
          <option value="empleado">Empleado</option>
          <option value="manager">Manager</option>
          <option value="rrhh">RRHH</option>
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
