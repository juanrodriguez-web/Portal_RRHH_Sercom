"use client";

import { useState } from "react";
import type { User } from "@/generated/prisma/client";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TrashIcon, EditIcon } from "@/components/ui/icons";
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
  const [editandoNombre, setEditandoNombre] = useState(false);
  const [editandoEmail, setEditandoEmail] = useState(false);
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

  const cancelarEdicionNombre = () => {
    if (name !== usuario.name) {
      setName(usuario.name);
      onFieldChange?.("name", usuario.name);
    }
    setEditandoNombre(false);
  };

  const cancelarEdicionEmail = () => {
    if (email !== usuario.email) {
      setEmail(usuario.email);
      onFieldChange?.("email", usuario.email);
    }
    setEditandoEmail(false);
  };

  return (
    <tr className={`border-b border-border last:border-0 ${hasChanges ? "bg-blue-50 dark:bg-blue-950/20" : ""}`}>
      <td className="py-2 pr-4">
        {editandoNombre ? (
          <div className="flex items-center gap-1">
            <input
              autoFocus
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && cancelarEdicionNombre()}
              className="w-32 rounded-[var(--radius-control)] border border-brand px-2 py-1 text-sm font-medium focus:ring-2 focus:ring-brand focus:outline-none"
            />
            <button
              type="button"
              title="Confirmar"
              onClick={() => setEditandoNombre(false)}
              className="rounded p-1 text-success hover:bg-success-tint"
            >
              ✓
            </button>
            <button
              type="button"
              title="Cancelar"
              onClick={cancelarEdicionNombre}
              className="rounded p-1 text-muted-foreground hover:bg-danger-tint hover:text-danger"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            type="button"
            title="Editar nombre"
            onClick={() => setEditandoNombre(true)}
            className="group flex items-center gap-1.5 rounded px-1 py-0.5 text-left font-medium hover:bg-muted"
          >
            {name}
            <EditIcon className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100" />
          </button>
        )}
      </td>
      <td className="py-2 pr-4">
        {editandoEmail ? (
          <div className="flex items-center gap-1">
            <input
              autoFocus
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && cancelarEdicionEmail()}
              title="Cambiar el email cambia con qué cuenta de Microsoft 365 inicia sesión esta persona. Solo edítalo para corregir un error de tipeo."
              className="w-44 rounded-[var(--radius-control)] border border-brand px-2 py-1 text-sm focus:ring-2 focus:ring-brand focus:outline-none"
            />
            <button
              type="button"
              title="Confirmar"
              onClick={() => setEditandoEmail(false)}
              className="rounded p-1 text-success hover:bg-success-tint"
            >
              ✓
            </button>
            <button
              type="button"
              title="Cancelar"
              onClick={cancelarEdicionEmail}
              className="rounded p-1 text-muted-foreground hover:bg-danger-tint hover:text-danger"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            type="button"
            title="Editar email"
            onClick={() => setEditandoEmail(true)}
            className="group flex items-center gap-1.5 rounded px-1 py-0.5 text-left text-sm text-muted-foreground hover:bg-muted"
          >
            {email}
            <EditIcon className="h-3.5 w-3.5 flex-shrink-0 opacity-0 group-hover:opacity-100" />
          </button>
        )}
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
