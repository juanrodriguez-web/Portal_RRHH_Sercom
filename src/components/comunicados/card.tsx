"use client";

import { useTransition } from "react";
import parse from "html-react-parser";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatFecha } from "@/lib/format";
import { archivarComunicado, marcarImportante, borrarComunicado } from "@/app/(portal)/comunicados/actions";
import { TrashIcon, EditIcon, StarIcon } from "@/components/ui/icons";

export type ComunicadoCardProps = {
  id: string;
  titulo: string;
  contenido: string;
  importante: boolean;
  createdAt: Date;
  autor: { name: string };
  puedeEditar: boolean;
  onEdit?: (id: string) => void;
  size?: "compact" | "featured";
};

export function ComunicadoCard({
  id,
  titulo,
  contenido,
  importante,
  createdAt,
  autor,
  puedeEditar,
  onEdit,
  size = "compact",
}: ComunicadoCardProps) {
  const [pending, startTransition] = useTransition();

  const extractText = (html: string, maxChars: number = 150) => {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    const text = temp.textContent || temp.innerText || "";
    return text.slice(0, maxChars).trim() + (text.length > maxChars ? "..." : "");
  };

  const extractoText = extractText(contenido, size === "featured" ? 200 : 120);

  return (
    <Card
      className={`relative flex flex-col overflow-hidden border-2 transition-all hover:shadow-md ${
        importante
          ? "border-warning bg-warning-tint"
          : "border-border bg-surface hover:border-border-strong"
      } ${size === "featured" ? "p-5" : "p-4"}`}
    >
      {/* Badge Importante */}
      {importante && (
        <div className="absolute right-3 top-3">
          <Badge tone="warning" className="flex items-center gap-1">
            <StarIcon className="h-3 w-3" />
            Importante
          </Badge>
        </div>
      )}

      {/* Contenido */}
      <div className={importante ? "pr-24" : ""}>
        <h3
          className={`font-bold text-foreground line-clamp-2 ${
            size === "featured" ? "text-base" : "text-sm"
          }`}
        >
          {titulo}
        </h3>

        <p className="mt-2 text-xs text-muted-foreground">
          {autor.name} · {formatFecha(createdAt)}
        </p>

        <p
          className={`mt-2 line-clamp-2 text-foreground ${
            size === "featured" ? "text-sm" : "text-xs"
          }`}
        >
          {extractoText}
        </p>
      </div>

      {/* Acciones RRHH */}
      {puedeEditar && (
        <div className="mt-3 flex gap-1 border-t border-border/30 pt-2">
          <Button
            size="xs"
            variant="ghost"
            title="Editar"
            disabled={pending}
            onClick={() => onEdit?.(id)}
            className="flex-1"
          >
            <EditIcon className="h-4 w-4" />
          </Button>
          <Button
            size="xs"
            variant="ghost"
            title={importante ? "Quitar destacado" : "Destacar"}
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await marcarImportante(id, !importante);
              })
            }
            className="flex-1"
          >
            <StarIcon className={`h-4 w-4 ${importante ? "fill-warning" : ""}`} />
          </Button>
          <Button
            size="xs"
            variant="ghost"
            title="Borrar"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await borrarComunicado(id);
              })
            }
            className="flex-1 text-danger hover:text-danger"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      )}
    </Card>
  );
}
