"use client";

import { useState } from "react";
import { PermisosEditor } from "./permisos-editor";
import { asignarPermisosIndividuales } from "@/app/(portal)/panel-rrhh/usuarios/actions";
import type { PermissionCode } from "@/lib/permissions";

interface UsuariosPermisosProps {
  userId: string;
  userName: string;
  permisos: PermissionCode[];
}

export function UsuariosPermisos({ userId, userName, permisos }: UsuariosPermisosProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleGuardar(nuevosPermisos: PermissionCode[]) {
    try {
      setError(null);
      const result = await asignarPermisosIndividuales(userId, nuevosPermisos);
      if (result.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="text-sm text-danger bg-danger-tint p-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="text-sm text-success bg-success-tint p-3 rounded">
          ✓ Permisos de {userName} guardados correctamente
        </div>
      )}
      <PermisosEditor
        userId={userId}
        permisosActuales={permisos}
        onGuardar={handleGuardar}
      />
    </div>
  );
}
