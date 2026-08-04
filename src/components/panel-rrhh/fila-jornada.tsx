"use client";

import { useState, useTransition } from "react";
import type { JornadaPlantilla } from "@/generated/prisma/client";
import { actualizarJornada } from "@/app/(portal)/panel-rrhh/jornadas/actions";

export function FilaJornada({ jornada }: { jornada: JornadaPlantilla }) {
  const [nombre, setNombre] = useState(jornada.nombre);
  const [tipo, setTipo] = useState(jornada.tipo);
  const [horasSemana, setHorasSemana] = useState(jornada.horasSemana?.toString() ?? "");
  const [tramo1Inicio, setTramo1Inicio] = useState(jornada.tramo1Inicio?.toString() ?? "");
  const [tramo1Fin, setTramo1Fin] = useState(jornada.tramo1Fin?.toString() ?? "");
  const [tramo2Inicio, setTramo2Inicio] = useState(jornada.tramo2Inicio?.toString() ?? "");
  const [tramo2Fin, setTramo2Fin] = useState(jornada.tramo2Fin?.toString() ?? "");
  const [tieneTramo2, setTieneTramo2] = useState(jornada.tieneTramo2);
  const [pending, startTransition] = useTransition();
  const [guardado, setGuardado] = useState(false);

  const formatoHora = (minutos: string): string => {
    if (!minutos) return "";
    const n = parseInt(minutos, 10);
    const horas = Math.floor(n / 60);
    const mins = n % 60;
    return `${horas.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  const minutosDe = (hh_mm: string): number => {
    if (!hh_mm) return 0;
    const [h, m] = hh_mm.split(":").map((x) => parseInt(x, 10));
    return h * 60 + (m || 0);
  };

  function guardar() {
    setGuardado(false);
    startTransition(async () => {
      await actualizarJornada(jornada.id, {
        nombre,
        tipo,
        tieneTramo2,
        horasSemana: horasSemana ? parseFloat(horasSemana) : undefined,
        tramo1Inicio: tramo1Inicio ? minutosDe(tramo1Inicio) : undefined,
        tramo1Fin: tramo1Fin ? minutosDe(tramo1Fin) : undefined,
        tramo2Inicio: tramo2Inicio ? minutosDe(tramo2Inicio) : undefined,
        tramo2Fin: tramo2Fin ? minutosDe(tramo2Fin) : undefined,
      });
      setGuardado(true);
    });
  }

  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-2 pr-4 font-medium w-40">
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full rounded-[var(--radius-control)] border border-border-strong px-2 py-1 text-sm"
        />
      </td>
      <td className="py-2 pr-4 w-20">
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="w-full rounded-[var(--radius-control)] border border-border-strong px-2 py-1 text-sm"
        >
          <option value="COMPLETA">Completa</option>
          <option value="PARCIAL">Parcial</option>
          <option value="INTENSIVA">Intensiva</option>
          <option value="PARTIDA">Partida</option>
        </select>
      </td>
      <td className="py-2 pr-4 w-20">
        <input
          type="number"
          step="0.5"
          value={horasSemana}
          onChange={(e) => setHorasSemana(e.target.value)}
          className="w-full rounded-[var(--radius-control)] border border-border-strong px-2 py-1 text-sm"
          placeholder="ej: 40"
        />
      </td>
      <td className="py-2 pr-4 w-16">
        <input
          type="time"
          value={formatoHora(tramo1Inicio)}
          onChange={(e) => setTramo1Inicio(e.target.value ? minutosDe(e.target.value).toString() : "")}
          className="w-full rounded-[var(--radius-control)] border border-border-strong px-2 py-1 text-sm"
        />
      </td>
      <td className="py-2 pr-4 w-16">
        <input
          type="time"
          value={formatoHora(tramo1Fin)}
          onChange={(e) => setTramo1Fin(e.target.value ? minutosDe(e.target.value).toString() : "")}
          className="w-full rounded-[var(--radius-control)] border border-border-strong px-2 py-1 text-sm"
        />
      </td>
      <td className="py-2 pr-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={tieneTramo2}
            onChange={(e) => setTieneTramo2(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm">¿Tiene pausa?</span>
        </label>
      </td>
      {tieneTramo2 && (
        <>
          <td className="py-2 pr-4 w-16">
            <input
              type="time"
              value={formatoHora(tramo2Inicio)}
              onChange={(e) => setTramo2Inicio(e.target.value ? minutosDe(e.target.value).toString() : "")}
              className="w-full rounded-[var(--radius-control)] border border-border-strong px-2 py-1 text-sm"
            />
          </td>
          <td className="py-2 pr-4 w-16">
            <input
              type="time"
              value={formatoHora(tramo2Fin)}
              onChange={(e) => setTramo2Fin(e.target.value ? minutosDe(e.target.value).toString() : "")}
              className="w-full rounded-[var(--radius-control)] border border-border-strong px-2 py-1 text-sm"
            />
          </td>
        </>
      )}
      <td className="py-2 pr-4">
        <button
          onClick={guardar}
          disabled={pending}
          className="text-sm font-semibold text-brand hover:underline disabled:opacity-50"
        >
          {pending ? "Guardando…" : guardado ? "Guardado ✓" : "Guardar"}
        </button>
      </td>
    </tr>
  );
}
