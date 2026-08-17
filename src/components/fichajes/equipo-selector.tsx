"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface EquipoItem {
  nombre: string;
  estado: string;
}

interface EquipoSelectorProps {
  equipoResumen: EquipoItem[];
}

export function EquipoSelector({ equipoResumen }: EquipoSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const date = new Date(selectedDate);
  const dayName = date.toLocaleDateString("es-ES", { weekday: "short" });
  const displayDate = date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  const isToday = new Date().toISOString().split("T")[0] === selectedDate;

  const handlePrevDay = () => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() - 1);
    const isoDate = newDate.toISOString().split("T")[0];
    setSelectedDate(isoDate);
    const params = new URLSearchParams(searchParams);
    params.set("equipoFecha", isoDate);
    router.push(`?${params.toString()}`);
  };

  const handleNextDay = () => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 1);
    const isoDate = newDate.toISOString().split("T")[0];
    setSelectedDate(isoDate);
    const params = new URLSearchParams(searchParams);
    params.set("equipoFecha", isoDate);
    router.push(`?${params.toString()}`);
  };

  const handleToday = () => {
    const todayIso = new Date().toISOString().split("T")[0];
    setSelectedDate(todayIso);
    const params = new URLSearchParams(searchParams);
    params.delete("equipoFecha");
    router.push(`?${params.toString()}`);
  };

  const getEstadoBadge = (estado: string) => {
    const est = estado.replaceAll("_", " ").toLowerCase();
    const colors: Record<string, string> = {
      "en_jornada": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
      "en pausa": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200",
      "finalizada": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200",
      "incompleta": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200",
      "no_iniciada": "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200",
    };
    const baseClass = colors[estado] || "bg-gray-100 text-gray-800";
    return `rounded px-2 py-0.5 text-xs font-semibold ${baseClass}`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-foreground">Mi equipo</h2>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrevDay}
            className="rounded-[var(--radius-control)] border border-border-strong px-2 py-1 text-sm hover:bg-background disabled:opacity-50"
          >
            ←
          </button>

          <div className="flex flex-col items-center gap-0.5 rounded-[var(--radius-control)] border border-border-strong px-3 py-1 text-center text-sm bg-surface min-w-fit">
            <span className={`text-xs font-semibold uppercase tracking-wide ${isToday ? "text-brand" : "text-muted-foreground"}`}>
              {dayName}
            </span>
            <span className="text-xs font-medium">{displayDate}</span>
          </div>

          <button
            onClick={handleNextDay}
            className="rounded-[var(--radius-control)] border border-border-strong px-2 py-1 text-sm hover:bg-background disabled:opacity-50"
          >
            →
          </button>

          {!isToday && (
            <button
              onClick={handleToday}
              className="rounded-[var(--radius-control)] border border-border-strong px-2 py-1 text-xs font-semibold hover:bg-background"
            >
              Hoy
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5 divide-y divide-border">
        {equipoResumen.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">No tienes empleados asignados.</p>
        ) : (
          equipoResumen.map((e) => (
            <div key={e.nombre} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
              <span className="text-sm font-medium">{e.nombre}</span>
              <span className={getEstadoBadge(e.estado)}>{e.estado.replaceAll("_", " ").toLowerCase()}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
