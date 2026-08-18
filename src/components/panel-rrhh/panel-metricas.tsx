"use client";

import { Card } from "@/components/ui/card";

interface MetricaProps {
  valor: number;
  etiqueta: string;
  icono: React.ReactNode;
  color: "brand" | "success" | "warning" | "danger" | "info";
  subtitle?: string;
}

const colorClasses = {
  brand: "bg-brand-tint text-brand border-brand/20",
  success: "bg-success-tint text-success border-success/20",
  warning: "bg-warning-tint text-warning border-warning/20",
  danger: "bg-danger-tint text-danger border-danger/20",
  info: "bg-info-tint text-info border-info/20",
};

const numbersColorClasses = {
  brand: "text-brand",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  info: "text-info",
};

export function Metrica({ valor, etiqueta, icono, color, subtitle }: MetricaProps) {
  return (
    <Card className={`p-6 border-2 ${colorClasses[color]} relative overflow-hidden`}>
      <div className="absolute top-2 right-2 opacity-5 text-3xl">{icono}</div>

      <div className="flex items-start gap-4 relative z-10">
        <div className={`p-3 rounded-lg ${colorClasses[color]} border`}>{icono}</div>

        <div className="flex-1">
          <div className={`text-3xl font-bold ${numbersColorClasses[color]}`}>{valor}</div>
          <p className="text-sm font-medium text-foreground mt-1">{etiqueta}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      </div>
    </Card>
  );
}
