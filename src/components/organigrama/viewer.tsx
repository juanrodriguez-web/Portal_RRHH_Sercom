"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ChevronDownIcon, ChevronRightIcon, SearchIcon } from "@/components/ui/icons";

interface Usuario {
  id: string;
  name: string;
  email: string;
  departamento: string | null;
  managerId: string | null;
  manager: { name: string } | null;
}

interface OrganigramaViewerProps {
  usuarios: Usuario[];
  departamentos: string[];
}

export function OrganigramaViewer({ usuarios, departamentos }: OrganigramaViewerProps) {
  const [busqueda, setBusqueda] = useState("");
  const [deptExpandidos, setDeptExpandidos] = useState<Set<string>>(new Set(departamentos));
  const [usuariosExpandidos, setUsuariosExpandidos] = useState<Set<string>>(new Set());

  // Filtrar usuarios según búsqueda
  const usuariosFiltrados = usuarios.filter(u =>
    u.name.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Agrupar por departamento
  const usuariosPorDepto: Record<string, Usuario[]> = {};
  departamentos.forEach(dept => {
    usuariosPorDepto[dept || "Sin departamento"] = usuariosFiltrados.filter(u => u.departamento === dept);
  });

  function toggleDepto(dept: string) {
    const nuevo = new Set(deptExpandidos);
    if (nuevo.has(dept)) {
      nuevo.delete(dept);
    } else {
      nuevo.add(dept);
    }
    setDeptExpandidos(nuevo);
  }

  function toggleUsuario(userId: string) {
    const nuevo = new Set(usuariosExpandidos);
    if (nuevo.has(userId)) {
      nuevo.delete(userId);
    } else {
      nuevo.add(userId);
    }
    setUsuariosExpandidos(nuevo);
  }

  // Encontrar subordinados de un usuario
  function getSubordinados(userId: string) {
    return usuariosFiltrados.filter(u => u.managerId === userId);
  }

  return (
    <div className="space-y-4">
      {/* Búsqueda */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-[var(--radius-control)] border border-border-strong bg-brand-tint"
        />
      </div>

      {/* Vista por departamento */}
      <div className="space-y-3">
        {departamentos.map(dept => {
          const deptoLabel = dept || "Sin departamento";
          const usuarios = usuariosPorDepto[deptoLabel];
          if (usuarios.length === 0) return null;

          return (
            <Card key={dept || "sin-dept"} className="overflow-hidden">
              <button
                onClick={() => toggleDepto(deptoLabel)}
                className="w-full flex items-center gap-2 p-4 hover:bg-muted transition"
              >
                {deptExpandidos.has(deptoLabel) ? (
                  <ChevronDownIcon className="h-4 w-4" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4" />
                )}
                <span className="font-semibold text-foreground">{deptoLabel}</span>
                <span className="ml-auto text-xs text-muted-foreground">{usuarios.length} usuarios</span>
              </button>

              {deptExpandidos.has(deptoLabel) && (
                <div className="border-t border-border bg-muted/50 divide-y divide-border">
                  {usuarios.map(usuario => {
                    const subordinados = getSubordinados(usuario.id);
                    const tieneSubordinados = subordinados.length > 0;

                    return (
                      <div key={usuario.id}>
                        <button
                          onClick={() => tieneSubordinados && toggleUsuario(usuario.id)}
                          className="w-full flex items-start gap-3 p-4 hover:bg-muted transition text-left"
                        >
                          {tieneSubordinados && (
                            <>
                              {usuariosExpandidos.has(usuario.id) ? (
                                <ChevronDownIcon className="h-4 w-4 mt-1 flex-shrink-0" />
                              ) : (
                                <ChevronRightIcon className="h-4 w-4 mt-1 flex-shrink-0" />
                              )}
                            </>
                          )}
                          {!tieneSubordinados && <div className="w-4 flex-shrink-0" />}

                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-foreground">{usuario.name}</div>
                            <div className="text-sm text-muted-foreground">{usuario.email}</div>
                            {usuario.manager && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Reporta a: {usuario.manager.name}
                              </div>
                            )}
                          </div>
                        </button>

                        {/* Subordinados */}
                        {tieneSubordinados && usuariosExpandidos.has(usuario.id) && (
                          <div className="border-l-2 border-muted-foreground/30 ml-[22px] pl-4 bg-muted/25">
                            {subordinados.map(sub => (
                              <div key={sub.id} className="py-3 px-4 border-b border-border/50 last:border-b-0">
                                <div className="font-medium text-foreground">{sub.name}</div>
                                <div className="text-sm text-muted-foreground">{sub.email}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {usuariosFiltrados.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No se encontraron usuarios que coincidan con tu búsqueda</p>
        </Card>
      )}
    </div>
  );
}
