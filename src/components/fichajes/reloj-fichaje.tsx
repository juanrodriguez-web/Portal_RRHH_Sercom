"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
  marcacionesDelDia = [],
}: {
  estadoInicial: EstadoJornada;
  accion: AccionFichaje | null;
  minutosTrabajadosInicial: number;
  marcacionesDelDia?: Array<{ tipo: string; tramo: number }>;
}) {
  const router = useRouter();
  const [ahora, setAhora] = useState<Date | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => setAhora(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const estado = ESTADO_LABEL[estadoInicial];

  const secuencia = [
    { tipo: "ENTRADA", tramo: 1, etiqueta: "Entrada mañana" },
    { tipo: "SALIDA", tramo: 1, etiqueta: "Fin mañana" },
    { tipo: "ENTRADA", tramo: 2, etiqueta: "Entrada tarde" },
    { tipo: "SALIDA", tramo: 2, etiqueta: "Fin de jornada" },
  ];

  const isMarcacionHecha = (tipo: string, tramo: number) => {
    return marcacionesDelDia.some((m) => m.tipo === tipo && m.tramo === tramo);
  };

  const primerNoHecho = secuencia.findIndex((a) => !isMarcacionHecha(a.tipo, a.tramo));
  const botonesMostrados = primerNoHecho >= 0 ? [primerNoHecho, primerNoHecho + 1] : [secuencia.length - 1];
  const accionesVisibles = botonesMostrados.map((i) => secuencia[i]).filter(Boolean);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const res = await marcarFichaje();
      if (!res.ok) {
        setError(res.error);
      } else {
        setTimeout(() => window.location.reload(), 500);
      }
    });
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Fichaje de hoy</span>
        <Badge tone={estado.tono}>{estado.texto}</Badge>
      </div>

      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:gap-6">
        <div className="flex flex-col justify-between">
          <div className="font-mono text-3xl font-bold tabular-nums text-foreground sm:text-5xl">
            {ahora ? new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(ahora) : "--:--:--"}
          </div>
          <p className="text-sm text-muted-foreground">
            Hoy llevas <span className="font-semibold text-foreground">{formatMinutos(minutosTrabajadosInicial)}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          {accion ? (
            accionesVisibles.map((a, idx) => {
              const esActivo = idx === 0;
              const hecha = isMarcacionHecha(a.tipo, a.tramo);

              return (
                <Button
                  key={`${a.tipo}-${a.tramo}`}
                  variant={esActivo && !hecha ? "primary" : "secondary"}
                  onClick={esActivo && !hecha ? handleClick : undefined}
                  disabled={hecha || pending}
                  className="px-6 py-3 text-sm font-bold rounded-lg"
                >
                  {hecha ? "✓ " : ""}{a.etiqueta}
                </Button>
              );
            })
          ) : (
            <p className="text-sm font-medium text-muted-foreground">Jornada finalizada.</p>
          )}
        </div>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </Card>
  );
}
