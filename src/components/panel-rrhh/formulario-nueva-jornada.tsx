"use client";

import { useState, useTransition } from "react";
import { crearJornada } from "@/app/(portal)/panel-rrhh/jornadas/actions";
import { Button } from "@/components/ui/button";

type TabType = "info" | "horarios" | "preview";

export function FormularioNuevaJornada() {
  const [activeTab, setActiveTab] = useState<TabType>("info");
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("PARTIDA");
  const [horasSemana, setHorasSemana] = useState("");
  const [tieneTramo2, setTieneTramo2] = useState(true);
  const [tramo1Inicio, setTramo1Inicio] = useState("09:00");
  const [tramo1Fin, setTramo1Fin] = useState("14:00");
  const [tramo2Inicio, setTramo2Inicio] = useState("15:00");
  const [tramo2Fin, setTramo2Fin] = useState("18:00");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const minutosDe = (hh_mm: string): number => {
    if (!hh_mm) return 0;
    const [h, m] = hh_mm.split(":").map((x) => parseInt(x, 10));
    return h * 60 + (m || 0);
  };

  const renderPreview = () => {
    const t1h = minutosDe(tramo1Inicio);
    const t1f = minutosDe(tramo1Fin);
    const t2h = tieneTramo2 ? minutosDe(tramo2Inicio) : 0;
    const t2f = tieneTramo2 ? minutosDe(tramo2Fin) : 0;

    const horas1 = ((t1f - t1h) / 60).toFixed(1);
    const horas2 = tieneTramo2 ? ((t2f - t2h) / 60).toFixed(1) : 0;
    const totalHoras = (parseFloat(horas1) + parseFloat(horas2 as any)).toFixed(1);

    return (
      <div className="space-y-3 text-sm">
        <div className="rounded-[var(--radius-control)] border border-border bg-background p-4">
          <h4 className="font-semibold text-foreground mb-2">{nombre || "Nueva jornada"}</h4>
          <div className="space-y-1.5 text-muted-foreground">
            <p>Tipo: <span className="font-medium text-foreground">{tipo}</span></p>
            <p>Tramo 1: <span className="font-medium text-foreground">{tramo1Inicio} - {tramo1Fin}</span> ({horas1}h)</p>
            {tieneTramo2 && (
              <p>Tramo 2: <span className="font-medium text-foreground">{tramo2Inicio} - {tramo2Fin}</span> ({horas2}h)</p>
            )}
            <p className="pt-2 border-t border-border">
              Total: <span className="font-bold text-foreground text-base">{totalHoras}h</span>
              {horasSemana && <span className="ml-2 text-muted-foreground">(definido: {horasSemana}h)</span>}
            </p>
          </div>
        </div>
      </div>
    );
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    startTransition(async () => {
      try {
        await crearJornada({
          nombre,
          tipo,
          tieneTramo2,
          horasSemana: horasSemana ? parseFloat(horasSemana) : undefined,
          tramo1Inicio: tramo1Inicio ? minutosDe(tramo1Inicio) : undefined,
          tramo1Fin: tramo1Fin ? minutosDe(tramo1Fin) : undefined,
          tramo2Inicio: tramo2Inicio ? minutosDe(tramo2Inicio) : undefined,
          tramo2Fin: tramo2Fin ? minutosDe(tramo2Fin) : undefined,
        });
        // Reset form
        setNombre("");
        setHorasSemana("");
        setTramo1Inicio("09:00");
        setTramo1Fin("14:00");
        setTramo2Inicio("15:00");
        setTramo2Fin("18:00");
        setTipo("PARTIDA");
        setTieneTramo2(true);
        setActiveTab("info");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al crear jornada");
      }
    });
  }

  const tabs: Array<{ id: TabType; label: string }> = [
    { id: "info", label: "Info general" },
    { id: "horarios", label: "Horarios" },
    { id: "preview", label: "Previsualización" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-[var(--radius-control)] text-red-700 dark:text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-brand text-brand"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === "info" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">Nombre *</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="ej: Jornada partida"
                className="w-full rounded-[var(--radius-control)] border border-border-strong px-3 py-2 text-sm focus:ring-2 focus:ring-brand focus:outline-none"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tipo</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full rounded-[var(--radius-control)] border border-border-strong px-3 py-2 text-sm focus:ring-2 focus:ring-brand focus:outline-none"
              >
                <option value="COMPLETA">Completa</option>
                <option value="PARCIAL">Parcial</option>
                <option value="INTENSIVA">Intensiva</option>
                <option value="PARTIDA">Partida</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Horas/semana</label>
              <input
                type="number"
                step="0.5"
                value={horasSemana}
                onChange={(e) => setHorasSemana(e.target.value)}
                placeholder="ej: 37.5"
                className="w-full rounded-[var(--radius-control)] border border-border-strong px-3 py-2 text-sm focus:ring-2 focus:ring-brand focus:outline-none"
              />
              <p className="text-xs text-muted-foreground mt-1">Opcional</p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium h-full items-end mb-2">
                <input
                  type="checkbox"
                  checked={tieneTramo2}
                  onChange={(e) => setTieneTramo2(e.target.checked)}
                  className="rounded w-4 h-4 focus:ring-2 focus:ring-brand"
                />
                ¿Incluir pausa?
              </label>
            </div>
          </div>
        )}

        {activeTab === "horarios" && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-3">Tramo 1</h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Inicio</label>
                  <input
                    type="time"
                    value={tramo1Inicio}
                    onChange={(e) => setTramo1Inicio(e.target.value)}
                    className="w-full rounded-[var(--radius-control)] border border-border-strong px-3 py-2 text-sm focus:ring-2 focus:ring-brand focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Fin</label>
                  <input
                    type="time"
                    value={tramo1Fin}
                    onChange={(e) => setTramo1Fin(e.target.value)}
                    className="w-full rounded-[var(--radius-control)] border border-border-strong px-3 py-2 text-sm focus:ring-2 focus:ring-brand focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {tieneTramo2 && (
              <div>
                <h4 className="text-sm font-semibold mb-3">Tramo 2 (después de pausa)</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Inicio</label>
                    <input
                      type="time"
                      value={tramo2Inicio}
                      onChange={(e) => setTramo2Inicio(e.target.value)}
                      className="w-full rounded-[var(--radius-control)] border border-border-strong px-3 py-2 text-sm focus:ring-2 focus:ring-brand focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Fin</label>
                    <input
                      type="time"
                      value={tramo2Fin}
                      onChange={(e) => setTramo2Fin(e.target.value)}
                      className="w-full rounded-[var(--radius-control)] border border-border-strong px-3 py-2 text-sm focus:ring-2 focus:ring-brand focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "preview" && renderPreview()}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2 border-t border-border">
        <Button type="submit" disabled={pending}>
          {pending ? "Creando…" : "Crear jornada"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setActiveTab("info");
            setNombre("");
            setHorasSemana("");
            setTramo1Inicio("09:00");
            setTramo1Fin("14:00");
            setTramo2Inicio("15:00");
            setTramo2Fin("18:00");
            setTipo("PARTIDA");
            setTieneTramo2(true);
            setError("");
          }}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
