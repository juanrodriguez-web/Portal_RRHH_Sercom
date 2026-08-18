"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";

interface AccionProps {
  href: string;
  titulo: string;
  descripcion: string;
  icono: React.ReactNode;
  color: "primary" | "secondary" | "tertiary";
}

const colorClasses = {
  primary: "bg-brand-tint text-brand border-brand/20 hover:bg-brand-tint/80",
  secondary: "bg-info-tint text-info border-info/20 hover:bg-info-tint/80",
  tertiary: "bg-warning-tint text-warning border-warning/20 hover:bg-warning-tint/80",
};

export function AccionRapida({ href, titulo, descripcion, icono, color }: AccionProps) {
  return (
    <Link href={href}>
      <Card className={`p-6 border-2 cursor-pointer transition-all hover:shadow-md ${colorClasses[color]}`}>
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-white/50 text-2xl flex-shrink-0">{icono}</div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm">{titulo}</h3>
            <p className="text-xs text-muted-foreground mt-1">{descripcion}</p>
          </div>

          <div className="text-xl flex-shrink-0">→</div>
        </div>
      </Card>
    </Link>
  );
}
