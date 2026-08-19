"use client";

import { useState } from "react";
import type { User } from "@/generated/prisma/client";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TrashIcon } from "@/components/ui/icons";
import { detectarGrupoUsuario } from "@/lib/permissions";

type UsuarioConPermisos = User & {
  permisos: { permissionCode: string }[];
};

interface FilaUsuarioProps {
  usuario: UsuarioConPermisos;
  managers: { id: string; name: string }[];
  onFieldChange?: (fieldName: string, value: unknown) => void;
  hasChanges?: boolean;
  onBorrar?: () => void;
  borrando?: boolean;
}

export function FilaUsuario({
  usuario,
  managers,
  onFieldChange,
  hasChanges = false,
  onBorrar,
  borrando = false,
}: FilaUsuarioProps) {
  const [name, setName] = useState(usuario.name);
  const [email, setEmail] = useState(usuario.email);
  const [departamento, setDepartamento] = useState(usuario.departamento ?? "");
  const [managerId, setManagerId] = useState(usuario.managerId ?? "");
  const [estado, setEstado] = useState(usuario.estado);
  const grupoDetectado = detectarGrupoUsuario(usuario.permisos);
  const esPersonalizado = grupoDetectado === "custom";
  const [grupoPermisos, setGrupoPermisos] = useState<"empleado" | "manager" | "rrhh" | "">(
    esPersonalizado ? "" : grupoDetectado
  );

  const handleNameChange = (value: string) => {
    setName(value);
    onFieldChange?.("name", value);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    onFieldChange?.("email", value);
  };

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
      <td className="py-2 pr-4">
        <input
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="w-36 rounded-[var(--radius-control)] border border-border-strong px-2 py-1 text-sm font-medium focus:ring-2 focus:ring-brand focus:outline-none"
        />
      </td>
      <td className="py-2 pr-4">
        <input
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          title="Cambiar el email cambia con qué cuenta de Microsoft 365 inicia sesión esta persona. Solo edítalo para corregir un error de tipeo."
          className="w-48 rounded-[var(--radius-control)] border border-border-strong px-2 py-1 text-sm text-muted-foreground focus:ring-2 focus:ring-brand focus:outline-none"
        />
      </td>
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
          title={esPersonalizado ? "Tiene permisos personalizados fuera de los 3 grupos estándar. Elegir un rol aquí y guardar los reemplaza por el set por defecto de ese grupo." : undefined}
          className={`rounded-[var(--radius-control)] border px-2 py-1 text-sm focus:ring-2 focus:ring-brand focus:outline-none ${
            esPersonalizado ? "border-warning" : "border-border-strong"
          }`}
        >
          <option value="">—</option>
          <option value="empleado">Empleado</option>
          <option value="manager">Manager</option>
          <option value="rrhh">RRHH</option>
        </select>
        {esPersonalizado && (
          <div className="mt-1 text-xs font-medium text-warning" title="Permisos distintos a los 3 grupos estándar">
            Personalizado ({usuario.permisos.length})
          </div>
        )}
      </td>
      <td className="py-2 pr-2 text-right">
        {onBorrar && (
          <ConfirmDialog
            title={`¿Borrar a ${usuario.name}?`}
            description="Solo es posible si no tiene fichajes, vacaciones, comunicados ni equipo a su cargo. Si ya tuvo actividad, usa 'Baja' en la columna Estado en su lugar."
            confirmText="Borrar"
            onConfirm={onBorrar}
          >
            <button
              type="button"
              title="Borrar usuario"
              disabled={borrando}
              className="rounded p-1.5 text-muted-foreground hover:bg-danger-tint hover:text-danger disabled:opacity-50"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </ConfirmDialog>
        )}
      </td>
    </tr>
  );
}
