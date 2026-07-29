"use client";

import { useEffect, useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatMinutos } from "@/lib/format";
import { marcarFichaje } from "@/app/(portal)/fichajes/actions";
import type { EstadoJornada, AccionFichaje } from "@/lib/fichajes";

const ESTADO_LABEL: Record<EstadoJornada, { texto: string; tono: "neutral" | "success" | "brand" }> = {
  NO_INICIADA: { texto: "Fuera de jornada", tono: "neutral" },
  EN_TRAMO_1: { texto: "En jornada", tono: "success" },
  EN_PAUSA: { texto: "En pausa", tono: "brand" },
  EN_TRAMO_2: { texto: "En jornada", tono: "success" },
  FINALIZADA: { texto: "Jornada finalizada", tono: "neutral" },
};

export function RelojFichaje({
  estadoInicial,
  accion,
  minutosTrabajadosInicial,
}: {
  estadoInicial: EstadoJornada;
  accion: AccionFichaje | null;
  minutosTrabajadosInicial: number;
}) {
  const [ahora, setAhora] = useState<Date | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => setAhora(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const estado = ESTADO_LABEL[estadoInicial];

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const res = await marcarFichaje();
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          {ahora ? new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long" }).format(ahora) : ""}
        </span>
        <Badge tone={estado.tono}>{estado.texto}</Badge>
      </div>

      <div className="font-mono text-5xl font-bold tabular-nums text-foreground">
        {ahora ? new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(ahora) : "--:--:--"}
      </div>

      <p className="text-sm text-muted-foreground">
        Hoy llevas <span className="font-semibold text-foreground">{formatMinutos(minutosTrabajadosInicial)}</span>
      </p>

      {accion ? (
        <Button size="md" variant="success" onClick={handleClick} disabled={pending} className="self-start">
          {pending ? "Registrando…" : accion.etiqueta}
        </Button>
      ) : (
        <p className="text-sm font-medium text-muted-foreground">No hay ninguna acción pendiente.</p>
      )}

      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </Card>
  );
}
