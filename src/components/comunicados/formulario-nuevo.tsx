"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { EditorComunicado } from "@/components/comunicados/editor";
import { crearComunicado } from "@/app/(portal)/comunicados/actions";

export function FormularioNuevoComunicado() {
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [imagen, setImagen] = useState<string | null>(null);
  const [importante, setImportante] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("La imagen no debe exceder 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagen(event.target?.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveImage() {
    setImagen(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(false);
    startTransition(async () => {
      const res = await crearComunicado(titulo, contenido, importante, imagen);
      if (!res.ok) {
        setError(res.error);
      } else {
        setOk(true);
        setTitulo("");
        setContenido("");
        setImagen(null);
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
          disabled={pending}
        />
        <span className="text-xs text-muted-foreground">{titulo.length}/200</span>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Contenido
        <EditorComunicado value={contenido} onChange={setContenido} />
      </label>

      {/* Imagen */}
      <label className="flex flex-col gap-2 text-sm">
        Imagen (opcional)
        {imagen ? (
          <div className="relative h-40 w-full overflow-hidden rounded border border-border">
            <Image src={imagen} alt="preview" fill className="object-cover" />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute right-2 top-2 rounded bg-danger px-2 py-1 text-xs font-semibold text-white"
            >
              Quitar
            </button>
          </div>
        ) : (
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="rounded border border-dashed border-border-strong bg-background p-2 text-sm"
            disabled={pending}
          />
        )}
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={importante}
          onChange={(e) => setImportante(e.target.checked)}
          className="rounded border border-border-strong"
          disabled={pending}
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
