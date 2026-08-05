"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { crearComunicado } from "@/app/(portal)/comunicados/actions";

export function FormularioNuevoComunicado() {
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [importante, setImportante] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(false);
    startTransition(async () => {
      const res = await crearComunicado(titulo, contenido, importante);
      if (!res.ok) {
        setError(res.error);
      } else {
        setOk(true);
        setTitulo("");
        setContenido("");
        setImportante(false);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Título
        <input
          type="text"
          required
          maxLength={200}
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ej. Actualización de procesos RRHH"
          className="rounded-[var(--radius-control)] border border-border-strong bg-brand-tint px-3 py-2"
        />
        <span className="text-xs text-muted-foreground">{titulo.length}/200</span>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Contenido
        <textarea
          required
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          placeholder="Contenido del comunicado..."
          rows={4}
          className="rounded-[var(--radius-control)] border border-border-strong px-3 py-2"
        />
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={importante}
          onChange={(e) => setImportante(e.target.checked)}
          className="rounded border border-border-strong"
        />
        <span className="text-sm text-foreground">Marcar como importante</span>
      </label>

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Enviando…" : "Crear comunicado"}
      </Button>

      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {ok ? <p className="text-sm text-success">Comunicado creado.</p> : null}
    </form>
  );
}
