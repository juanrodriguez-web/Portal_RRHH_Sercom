"use client";

import { useState, useTransition } from "react";
import { crearJornada } from "@/app/(portal)/panel-rrhh/jornadas/actions";

export function FormularioNuevaJornada() {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("PARTIDA");
  const [horasSemana, setHorasSemana] = useState("");
  const [tieneTramo2, setTieneTramo2] = useState(true);
  const [tramo1Inicio, setTramo1Inicio] = useState("");
  const [tramo1Fin, setTramo1Fin] = useState("");
  const [tramo2Inicio, setTramo2Inicio] = useState("");
  const [tramo2Fin, setTramo2Fin] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const minutosDe = (hh_mm: string): number => {
    if (!hh_mm) return 0;
    const [h, m] = hh_mm.split(":").map((x) => parseInt(x, 10));
    return h * 60 + (m || 0);
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
        setTramo1Inicio("");
        setTramo1Fin("");
        setTramo2Inicio("");
        setTramo2Fin("");
        setTipo("PARTIDA");
        setTieneTramo2(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al crear jornada");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      {error && <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">{error}</div>}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre *</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="ej: Jornada partida — 37.5 horas"
            className="w-full rounded-[var(--radius-control)] border border-border-strong px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tipo</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full rounded-[var(--radius-control)] border border-border-strong px-3 py-2 text-sm"
          >
            <option value="COMPLETA">Completa</option>
            <option value="PARCIAL">Parcial</option>
            <option value="INTENSIVA">Intensiva</option>
            <option value="PARTIDA">Partida</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Horas/semana</label>
          <input
            type="number"
            step="0.5"
            value={horasSemana}
            onChange={(e) => setHorasSemana(e.target.value)}
            placeholder="ej: 37.5"
            className="w-full rounded-[var(--radius-control)] border border-border-strong px-3 py-2 text-sm"
          />
          <p className="text-xs text-muted-foreground mt-1">Opcional si defines horarios específicos</p>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={tieneTramo2}
              onChange={(e) => setTieneTramo2(e.target.checked)}
              className="rounded"
            />
            ¿Tiene pausa?
          </label>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Tramo 1</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Inicio</label>
            <input
              type="time"
              value={tramo1Inicio}
              onChange={(e) => setTramo1Inicio(e.target.value)}
              className="w-full rounded-[var(--radius-control)] border border-border-strong px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Fin</label>
            <input
              type="time"
              value={tramo1Fin}
              onChange={(e) => setTramo1Fin(e.target.value)}
              className="w-full rounded-[var(--radius-control)] border border-border-strong px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {tieneTramo2 && (
        <div>
          <p className="text-sm font-medium mb-2">Tramo 2</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Inicio</label>
              <input
                type="time"
                value={tramo2Inicio}
                onChange={(e) => setTramo2Inicio(e.target.value)}
                className="w-full rounded-[var(--radius-control)] border border-border-strong px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Fin</label>
              <input
                type="time"
                value={tramo2Fin}
                onChange={(e) => setTramo2Fin(e.target.value)}
                className="w-full rounded-[var(--radius-control)] border border-border-strong px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="px-4 py-2 bg-brand text-white rounded-[var(--radius-control)] font-semibold hover:opacity-90 disabled:opacity-50 transition"
      >
        {pending ? "Creando…" : "Crear jornada"}
      </button>
    </form>
  );
}
