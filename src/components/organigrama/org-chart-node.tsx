"use client";

import type { OrgChartUser } from "@/app/(portal)/panel-rrhh/actions";

export function OrgChartNode({ user, level = 0 }: { user: OrgChartUser; level?: number }) {
  const hasChildren = user.reportes && user.reportes.length > 0;

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Card del Usuario */}
      <div className="flex flex-col items-center">
        <div className="rounded-lg border-2 border-brand bg-surface p-4 shadow-sm min-w-48">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-center text-sm font-semibold text-foreground">{user.name}</h3>
            {user.departamento && (
              <p className="text-center text-xs text-muted-foreground">{user.departamento}</p>
            )}
          </div>
        </div>
      </div>

      {/* Línea vertical hacia reportes */}
      {hasChildren && (
        <>
          <div className="h-6 w-0.5 bg-border" />

          {/* Línea horizontal conectando reportes */}
          <div className="flex items-start gap-0">
            <div className="relative">
              {/* Línea horizontal */}
              <div className="h-0.5 bg-border" style={{ width: `${(user.reportes!.length - 1) * 180 + 100}px` }} />

              {/* Líneas verticales bajando a cada reporte */}
              <div className="absolute top-0 flex gap-96">
                {user.reportes!.map((reportado) => (
                  <div
                    key={reportado.id}
                    className="absolute top-0 h-6 w-0.5 bg-border"
                    style={{
                      left: `${user.reportes!.indexOf(reportado) * 300 + 100}px`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Grid de reportes */}
          <div className="flex gap-16 flex-wrap justify-center">
            {user.reportes!.map((reportado) => (
              <div key={reportado.id}>
                <OrgChartNode user={reportado} level={level + 1} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
