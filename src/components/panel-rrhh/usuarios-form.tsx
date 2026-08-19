"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { FilaUsuario } from "./fila-usuario";
import { NuevoUsuarioModal } from "./nuevo-usuario-modal";

interface UsuariosFormProps {
  usuarios: Array<User & { permisos: Array<{ permissionCode: string }> }>;
  managers: Array<{ id: string; name: string }>;
  jornadas: Array<{ id: string; nombre: string }>;
}

export function UsuariosForm({ usuarios, managers, jornadas }: UsuariosFormProps) {
  const router = useRouter();
  const [changes, setChanges] = useState<Map<string, Record<string, unknown>>>(new Map());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [creando, setCreando] = useState(false);
  const [borrandoId, setBorrandoId] = useState<string | null>(null);
  const [errorBorrar, setErrorBorrar] = useState<string | null>(null);

  const handleBorrar = async (usuarioId: string) => {
    setBorrandoId(usuarioId);
    setErrorBorrar(null);
    try {
      const res = await fetch("/api/usuarios/borrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorBorrar(data.error || "Error al borrar el usuario.");
        return;
      }
      router.refresh();
    } catch {
      setErrorBorrar("Error al borrar el usuario.");
    } finally {
      setBorrandoId(null);
    }
  };

  const hasChanges = changes.size > 0;

  const handleRowChange = (usuarioId: string, fieldName: string, value: unknown) => {
    setChanges((prev) => {
      const newMap = new Map(prev);
      const rowChanges = newMap.get(usuarioId) || {};
      rowChanges[fieldName] = value;
      newMap.set(usuarioId, rowChanges);
      return newMap;
    });
    setSaved(false);
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    setSaving(true);
    try {
      const updates = Array.from(changes.entries()).map(([usuarioId, fieldChanges]) => ({
        usuarioId,
        ...fieldChanges,
      }));

      // Guardar cada cambio
      for (const update of updates) {
        const res = await fetch("/api/usuarios/actualizar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(update),
        });

        if (!res.ok) throw new Error("Error al guardar");
      }

      setSaved(true);
      setChanges(new Map());
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setChanges(new Map());
    setSaved(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{usuarios.length} empleados</p>
        <Button size="sm" onClick={() => setCreando(true)} className="gap-1">
          + Nuevo empleado
        </Button>
      </div>

      {errorBorrar && (
        <div className="rounded border border-danger/30 bg-danger-tint px-3 py-2 text-sm text-danger">
          {errorBorrar}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="py-2 pr-4">Nombre</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Departamento</th>
              <th className="py-2 pr-4">Manager</th>
              <th className="py-2 pr-4">Estado</th>
              <th className="py-2 pr-4">Rol</th>
              <th className="py-2 pr-4" />
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <FilaUsuario
                key={u.id}
                usuario={u}
                managers={managers}
                onFieldChange={(fieldName, value) => handleRowChange(u.id, fieldName, value)}
                hasChanges={!!changes.get(u.id)}
                onBorrar={() => handleBorrar(u.id)}
                borrando={borrandoId === u.id}
              />
            ))}
          </tbody>
        </table>
      </div>

      {hasChanges && (
        <div className="flex items-center gap-2 border-t border-border pt-3">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="gap-2"
          >
            {saving ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
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
                Guardando...
              </>
            ) : saved ? (
              <>
                <span className="text-lg">✓</span>
                Guardado
              </>
            ) : (
              "Guardar cambios"
            )}
          </Button>
          <Button variant="secondary" onClick={handleDiscard} disabled={saving}>
            Descartar
          </Button>
          {saved && <span className="text-sm text-green-600">Cambios guardados</span>}
        </div>
      )}

      {creando && (
        <NuevoUsuarioModal jornadas={jornadas} managers={managers} onClose={() => setCreando(false)} />
      )}
    </div>
  );
}
