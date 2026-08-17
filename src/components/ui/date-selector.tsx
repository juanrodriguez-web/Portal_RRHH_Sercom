"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "./button";

interface DateSelectorProps {
  currentDate?: string;
  onDateChange?: (date: string) => void;
  label?: string;
}

export function DateSelector({ currentDate = "", onDateChange, label = "Fecha" }: DateSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const dateValue = currentDate || new Date().toISOString().split("T")[0];
  const date = new Date(dateValue);

  const handlePrevDay = () => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() - 1);
    const isoDate = newDate.toISOString().split("T")[0];
    onDateChange?.(isoDate);
    const params = new URLSearchParams(searchParams);
    params.set("fecha", isoDate);
    router.push(`?${params.toString()}`);
  };

  const handleNextDay = () => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 1);
    const isoDate = newDate.toISOString().split("T")[0];
    onDateChange?.(isoDate);
    const params = new URLSearchParams(searchParams);
    params.set("fecha", isoDate);
    router.push(`?${params.toString()}`);
  };

  const handleToday = () => {
    const todayIso = new Date().toISOString().split("T")[0];
    onDateChange?.(todayIso);
    const params = new URLSearchParams(searchParams);
    params.set("fecha", todayIso);
    router.push(`?${params.toString()}`);
  };

  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isoDate = e.target.value;
    onDateChange?.(isoDate);
    const params = new URLSearchParams(searchParams);
    params.set("fecha", isoDate);
    router.push(`?${params.toString()}`);
    setIsOpen(false);
  };

  const dayName = date.toLocaleDateString("es-ES", { weekday: "long" });
  const displayDate = date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  const isToday =
    new Date().toISOString().split("T")[0] === dateValue;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={handlePrevDay}
        className="px-2"
      >
        ←
      </Button>

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex flex-col items-center gap-0.5 rounded-[var(--radius-control)] border border-border-strong px-3 py-1.5 text-center text-sm hover:bg-background"
        >
          <span className={`text-xs font-semibold uppercase tracking-wide ${isToday ? "text-brand" : "text-muted-foreground"}`}>
            {dayName.slice(0, 3)}
          </span>
          <span className="text-sm font-medium">{displayDate}</span>
        </button>

        {isOpen && (
          <input
            type="date"
            value={dateValue}
            onChange={handleDateInput}
            autoFocus
            className="absolute left-0 top-full mt-2 z-10 rounded-[var(--radius-control)] border border-border-strong px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        )}
      </div>

      <Button
        variant="secondary"
        size="sm"
        onClick={handleNextDay}
        className="px-2"
      >
        →
      </Button>

      {!isToday && (
        <Button
          variant="secondary"
          size="sm"
          onClick={handleToday}
          className="text-xs"
        >
          Hoy
        </Button>
      )}
    </div>
  );
}
