"use client";

import { useState } from "react";
import type { User } from "@/generated/prisma/client";
import { ChevronDownIcon, ChevronRightIcon } from "@/components/ui/icons";
import { UsuariosPermisos } from "./usuarios-permisos";

interface GestionarPermisosPanelProps {
  usuarios: Array<User & { permisos: Array<{ permissionCode: string }> }>;
}

export function GestionarPermisosPanel({ usuarios }: GestionarPermisosPanelProps) {
  const [abierto, setAbierto] = useState(false);
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());
  const [busqueda, setBusqueda] = useState("");

  const usuariosFiltrados = usuarios.filter(u =>
    u.name.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  function toggleUsuario(userId: string) {
    const nuevo = new Set(expandidos);
    if (nuevo.has(userId)) {
      nuevo.delete(userId);
    } else {
      nuevo.add(userId);
    }
    setExpandidos(nuevo);
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <h2 className="font-bold text-foreground">Personalizar permisos individuales</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Excepción: usa esto solo si un usuario necesita un permiso suelto fuera de su grupo (Empleado/Manager/RRHH).
            El caso normal es cambiar el "Rol" en la tabla de empleados de arriba.
          </p>
        </div>
        {abierto ? (
          <ChevronDownIcon className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
        )}
      </button>

      {abierto && (
        <>
      <input
        type="text"
        placeholder="Buscar usuario por nombre o email..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="w-full px-3 py-2 rounded border border-border-strong bg-brand-tint text-sm"
      />

      <div className="divide-y divide-border border border-border rounded">
        {usuariosFiltrados.map((usuario) => (
          <div key={usuario.id}>
            <button
              onClick={() => toggleUsuario(usuario.id)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition text-left"
            >
              {expandidos.has(usuario.id) ? (
                <ChevronDownIcon className="h-4 w-4 flex-shrink-0" />
              ) : (
                <ChevronRightIcon className="h-4 w-4 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground">{usuario.name}</div>
                <div className="text-xs text-muted-foreground">{usuario.email}</div>
              </div>
              <div className="text-xs text-muted-foreground flex-shrink-0">
                {usuario.permisos.length} permisos
              </div>
            </button>

            {expandidos.has(usuario.id) && (
              <div className="px-4 py-4 bg-muted/50 border-t border-border">
                <UsuariosPermisos
                  userId={usuario.id}
                  userName={usuario.name}
                  permisos={usuario.permisos.map(p => p.permissionCode as any)}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {usuariosFiltrados.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">No se encontraron usuarios</p>
        </div>
      )}
        </>
      )}
    </div>
  );
}
