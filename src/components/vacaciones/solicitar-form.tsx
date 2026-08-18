"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { solicitarVacaciones } from "@/app/(portal)/vacaciones/actions";

function SolicitarFormComponent() {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [comentario, setComentario] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, startTransition] = useTransition();

  const diasNaturales =
    fechaInicio && fechaFin
      ? Math.max(0, Math.round((new Date(fechaFin).getTime() - new Date(fechaInicio).getTime()) / 86_400_000) + 1)
      : 0;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setOk(false);
    startTransition(async () => {
      const res = await solicitarVacaciones(fechaInicio, fechaFin, comentario);
      if (!res.ok) {
        setError(res.error);
      } else {
        setOk(true);
        setFechaInicio("");
        setFechaFin("");
        setComentario("");
        setTimeout(() => setOk(false), 2000);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <h2 className="font-bold text-foreground">Solicitar vacaciones</h2>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Fecha inicio
          <input
            type="date"
            required
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="rounded-[var(--radius-control)] border border-border-strong bg-brand-tint px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Fecha fin
          <input
            type="date"
            required
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="rounded-[var(--radius-control)] border border-border-strong bg-brand-tint px-3 py-2"
          />
        </label>
      </div>
      <p className="text-sm text-muted-foreground">
        Días naturales solicitados: <span className="font-semibold text-foreground">{diasNaturales}</span>{" "}
        <span className="text-xs">(el cómputo final excluye festivos y fines de semana)</span>
      </p>
      <label className="flex flex-col gap-1 text-sm">
        Comentarios (opcional)
        <textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Ej. vacaciones de verano"
          rows={2}
          className="rounded-[var(--radius-control)] border border-border-strong px-3 py-2"
        />
      </label>
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Enviando…" : "Solicitar"}
      </Button>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {ok ? <p className="text-sm text-success">Solicitud enviada.</p> : null}
    </form>
  );
}

export { SolicitarFormComponent as SolicitarForm };
