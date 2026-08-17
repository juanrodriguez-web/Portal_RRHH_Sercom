"use client";

import { useState } from "react";
import type { User } from "@/generated/prisma/client";

type UsuarioConPermisos = User & {
  permisos: { permissionCode: string }[];
};

interface FilaUsuarioProps {
  usuario: UsuarioConPermisos;
  managers: { id: string; name: string }[];
  onFieldChange?: (fieldName: string, value: unknown) => void;
  hasChanges?: boolean;
}

export function FilaUsuario({
  usuario,
  managers,
  onFieldChange,
  hasChanges = false,
}: FilaUsuarioProps) {
  const [departamento, setDepartamento] = useState(usuario.departamento ?? "");
  const [managerId, setManagerId] = useState(usuario.managerId ?? "");
  const [estado, setEstado] = useState(usuario.estado);
  const [grupoPermisos, setGrupoPermisos] = useState<"empleado" | "manager" | "rrhh" | "">(
    usuario.permisos.length > 0 ? detectarGrupo(usuario.permisos) : ""
  );

  function detectarGrupo(permisos: { permissionCode: string }[]): "empleado" | "manager" | "rrhh" | "" {
    const codes = new Set(permisos.map((p) => p.permissionCode));
    if (codes.has("gestionarUsuariosRrhh")) return "rrhh";
    if (codes.has("aprobarVacacionesEquipo")) return "manager";
    if (codes.has("registrarFichajePropio")) return "empleado";
    return "";
  }

  const handleDepartamentoChange = (value: string) => {
    setDepartamento(value);
    onFieldChange?.("departamento", value);
  };

  const handleManagerChange = (value: string) => {
    setManagerId(value);
    onFieldChange?.("managerId", value || null);
  };

  const handleEstadoChange = (value: string) => {
    setEstado(value as "ACTIVO" | "BAJA");
    onFieldChange?.("estado", value);
  };

  const handleGrupoChange = (value: string) => {
    setGrupoPermisos(value as any);
    onFieldChange?.("grupoPermisos", value);
  };

  return (
    <tr className={`border-b border-border last:border-0 ${hasChanges ? "bg-blue-50 dark:bg-blue-950/20" : ""}`}>
      <td className="py-2 pr-4 font-medium">{usuario.name}</td>
      <td className="py-2 pr-4 text-sm text-muted-foreground">{usuario.email}</td>
      <td className="py-2 pr-4">
        <input
          value={departamento}
          onChange={(e) => handleDepartamentoChange(e.target.value)}
          className="w-32 rounded-[var(--radius-control)] border border-border-strong px-2 py-1 text-sm focus:ring-2 focus:ring-brand focus:outline-none"
        />
      </td>
      <td className="py-2 pr-4">
        <select
          value={managerId}
          onChange={(e) => handleManagerChange(e.target.value)}
          className="w-36 rounded-[var(--radius-control)] border border-border-strong px-2 py-1 text-sm focus:ring-2 focus:ring-brand focus:outline-none"
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
          onChange={(e) => handleEstadoChange(e.target.value)}
          className="rounded-[var(--radius-control)] border border-border-strong px-2 py-1 text-sm focus:ring-2 focus:ring-brand focus:outline-none"
        >
          <option value="ACTIVO">Activo</option>
          <option value="BAJA">Baja</option>
        </select>
      </td>
      <td className="py-2 pr-4">
        <select
          value={grupoPermisos}
          onChange={(e) => handleGrupoChange(e.target.value)}
          className="rounded-[var(--radius-control)] border border-border-strong px-2 py-1 text-sm focus:ring-2 focus:ring-brand focus:outline-none"
        >
          <option value="">—</option>
          <option value="empleado">Empleado</option>
          <option value="manager">Manager</option>
          <option value="rrhh">RRHH</option>
        </select>
      </td>
    </tr>
  );
}
