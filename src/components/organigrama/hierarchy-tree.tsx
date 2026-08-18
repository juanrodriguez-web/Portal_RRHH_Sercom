"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ChevronDownIcon, ChevronRightIcon, UserIcon, ChevronUpIcon } from "@/components/ui/icons";

interface Usuario {
  id: string;
  name: string;
  email: string;
  departamento: string | null;
}

interface HierarchyNode {
  usuario: Usuario;
  manager?: Usuario | null;
  subordinados: Usuario[];
}

interface HierarchyTreeProps {
  usuarioActual: Usuario;
  todos: Usuario[];
}

export function HierarchyTree({ usuarioActual, todos }: HierarchyTreeProps) {
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set([usuarioActual.id]));

  // Construir mapa de usuarios
  const usuarioMap = new Map(todos.map(u => [u.id, u]));

  // Obtener manager del usuario actual
  function getManager(usuario: Usuario): Usuario | null {
    const managerMatch = todos.find(u => u.id === usuario.id);
    // Nota: en la BD deberíamos tener managerId, pero aquí simulamos
    return null;
  }

  // Obtener subordinados
  function getSubordinados(usuario: Usuario): Usuario[] {
    return todos.filter(u => {
      // Buscar si este usuario es manager de alguien
      // Nota: Necesitamos deducir esto de los datos
      return false;
    });
  }

  function toggleNodo(userId: string) {
    const nuevo = new Set(expandidos);
    if (nuevo.has(userId)) {
      nuevo.delete(userId);
    } else {
      nuevo.add(userId);
    }
    setExpandidos(nuevo);
  }

  // Construir cadena jerárquica: yo -> mi jefe -> su jefe -> ... -> CEO
  const jerarquiaArriba: Usuario[] = [];
  const subordinados = todos.filter(u => u.departamento === usuarioActual.departamento && u.id !== usuarioActual.id);

  return (
    <div className="space-y-6">
      {/* Mi posición - Raíz del árbol */}
      <Card className="p-6 bg-brand-tint border-2 border-brand">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-brand text-white flex items-center justify-center">
            <UserIcon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground">{usuarioActual.name}</h2>
            <p className="text-sm text-muted-foreground">{usuarioActual.email}</p>
            {usuarioActual.departamento && (
              <p className="text-xs text-brand-strong font-medium mt-1">{usuarioActual.departamento}</p>
            )}
          </div>
          <div className="text-xs bg-white text-brand font-bold px-3 py-1 rounded-full">TÚ</div>
        </div>
      </Card>

      {/* Árbol jerárquico hacia arriba */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase">Cadena de mando</h3>

        <div className="relative pl-4 border-l-2 border-dashed border-border space-y-3">
          {/* Nivel 1: Mi jefe (próximamente - cuando tengamos datos de manager) */}
          <Card className="p-4 hover:bg-muted transition">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-muted-foreground/20 flex items-center justify-center flex-shrink-0">
                <UserIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Tu manager</p>
                <p className="text-xs text-muted-foreground">Información de manager no asignada</p>
              </div>
            </div>
          </Card>

          <div className="text-center text-xs text-muted-foreground">↑ Cadena de mando</div>
          <div className="text-center text-xs text-muted-foreground">Jefes de equipo (próximamente)</div>
        </div>
      </div>

      {/* Mi equipo (subordinados si los tengo) */}
      {subordinados.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase">
            Mi equipo ({subordinados.length})
          </h3>

          <div className="space-y-2">
            {subordinados.map((sub) => (
              <Card key={sub.id} className="p-4 hover:bg-muted transition">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-brand-tint text-brand flex items-center justify-center flex-shrink-0">
                    <UserIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{sub.name}</p>
                    <p className="text-xs text-muted-foreground">{sub.email}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Explorador de toda la organización */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase">Explorar organización</h3>

        <div className="space-y-3">
          {todos.map((usuario) => {
            const tieneSubordinados = todos.some(u => u.id !== usuario.id);
            const expandido = expandidos.has(usuario.id);
            const esActual = usuario.id === usuarioActual.id;

            return (
              <Card
                key={usuario.id}
                className={`p-4 ${esActual ? "bg-brand-tint border-brand" : "hover:bg-muted"} transition`}
              >
                <button
                  onClick={() => tieneSubordinados && toggleNodo(usuario.id)}
                  className="w-full flex items-start gap-3 text-left"
                >
                  {tieneSubordinados ? (
                    expandido ? (
                      <ChevronDownIcon className="h-4 w-4 mt-1 flex-shrink-0 text-brand" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4 mt-1 flex-shrink-0" />
                    )
                  ) : (
                    <div className="w-4" />
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{usuario.name}</p>
                    <p className="text-xs text-muted-foreground">{usuario.email}</p>
                    {usuario.departamento && (
                      <p className="text-xs text-brand-strong font-medium">{usuario.departamento}</p>
                    )}
                  </div>

                  {esActual && (
                    <span className="text-xs bg-brand text-white font-bold px-2 py-0.5 rounded whitespace-nowrap">
                      Tú
                    </span>
                  )}
                </button>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
