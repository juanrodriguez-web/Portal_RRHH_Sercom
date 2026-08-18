"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PERMISSION_GROUPS, PERMISSION_DESCRIPTIONS, PERMISSIONS } from "@/lib/permissions";
import type { PermissionCode } from "@/lib/permissions";

interface PermisosEditorProps {
  userId: string;
  permisosActuales: PermissionCode[];
  onGuardar: (permisos: PermissionCode[]) => Promise<void>;
  deshabilitado?: boolean;
}

export function PermisosEditor({ userId, permisosActuales, onGuardar, deshabilitado }: PermisosEditorProps) {
  const [permisos, setPermisos] = useState<Set<PermissionCode>>(new Set(permisosActuales));
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<keyof typeof PERMISSION_GROUPS | "custom">("custom");
  const [expandido, setExpandido] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const hasChanged = permisos.size !== permisosActuales.length ||
    permisosActuales.some(p => !permisos.has(p));

  function aplicarGrupo(grupo: keyof typeof PERMISSION_GROUPS) {
    const nuevosPermisos = new Set(PERMISSION_GROUPS[grupo]);
    setPermisos(nuevosPermisos);
    setGrupoSeleccionado(grupo);
    setExpandido(false);
  }

  function togglePermiso(codigo: PermissionCode) {
    const nuevo = new Set(permisos);
    if (nuevo.has(codigo)) {
      nuevo.delete(codigo);
    } else {
      nuevo.add(codigo);
    }
    setPermisos(nuevo);
    setGrupoSeleccionado("custom");
  }

  async function handleGuardar() {
    setGuardando(true);
    try {
      await onGuardar(Array.from(permisos));
      setGuardando(false);
    } catch {
      setGuardando(false);
    }
  }

  return (
    <Card className="space-y-4 p-4">
      <div>
        <h3 className="font-semibold text-foreground mb-3">Permisos</h3>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Grupo de permisos</label>
          <div className="flex gap-2 flex-wrap">
            {Object.keys(PERMISSION_GROUPS).map((grupo) => (
              <button
                key={grupo}
                onClick={() => aplicarGrupo(grupo as keyof typeof PERMISSION_GROUPS)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                  grupoSeleccionado === grupo
                    ? "bg-brand text-white"
                    : "bg-border text-foreground hover:bg-border-strong"
                }`}
                disabled={deshabilitado}
              >
                {grupo.charAt(0).toUpperCase() + grupo.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {grupoSeleccionado === "custom" && (
          <button
            onClick={() => setExpandido(!expandido)}
            className="mt-3 text-sm text-brand hover:underline font-medium"
          >
            {expandido ? "Ocultar" : "Mostrar"} permisos individuales
          </button>
        )}
      </div>

      {(expandido || grupoSeleccionado === "custom") && (
        <div className="space-y-2 border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">Permisos activos: {permisos.size}</p>
          <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
            {Object.entries(PERMISSIONS).map(([key, codigo]) => (
              <label key={codigo} className="flex items-start gap-2 cursor-pointer hover:bg-muted p-2 rounded">
                <input
                  type="checkbox"
                  checked={permisos.has(codigo)}
                  onChange={() => togglePermiso(codigo)}
                  disabled={deshabilitado}
                  className="mt-1 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground break-words">{key}</div>
                  <div className="text-xs text-muted-foreground">{PERMISSION_DESCRIPTIONS[codigo]}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {hasChanged && !deshabilitado && (
        <div className="flex gap-2 border-t border-border pt-4">
          <Button
            size="sm"
            onClick={handleGuardar}
            disabled={guardando}
          >
            {guardando ? "Guardando..." : "Guardar permisos"}
          </Button>
          <button
            onClick={() => {
              setPermisos(new Set(permisosActuales));
              setGrupoSeleccionado("custom");
            }}
            className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Descartar
          </button>
        </div>
      )}
    </Card>
  );
}
