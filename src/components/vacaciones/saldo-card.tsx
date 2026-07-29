import { Card } from "@/components/ui/card";

export function SaldoCard({
  totalAnual,
  disponible,
  reservado,
  consumido,
}: {
  totalAnual: number;
  disponible: number;
  reservado: number;
  consumido: number;
}) {
  const pct = totalAnual > 0 ? Math.max(0, Math.min(100, (disponible / totalAnual) * 100)) : 0;

  return (
    <Card className="flex items-center gap-6">
      <div
        className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(var(--brand) ${pct}%, var(--border) ${pct}% 100%)`,
        }}
      >
        <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-surface">
          <span className="text-2xl font-bold text-foreground">{disponible}</span>
          <span className="text-[0.65rem] text-muted-foreground">disponibles</span>
        </div>
      </div>
      <div className="flex flex-col gap-1.5 text-sm">
        <Fila color="bg-brand" label="Disponibles" valor={disponible} />
        <Fila color="bg-warning" label="Pendientes aprob." valor={reservado} />
        <Fila color="bg-border-strong" label="Disfrutados" valor={consumido} />
        <p className="mt-2 border-t border-border pt-1.5 font-semibold text-foreground">
          Total anual {totalAnual} días
        </p>
      </div>
    </Card>
  );
}

function Fila({ color, label, valor }: { color: string; label: string; valor: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-auto font-semibold text-foreground">{valor}</span>
    </div>
  );
}
