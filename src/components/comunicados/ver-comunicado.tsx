"use client";

import Image from "next/image";
import parse from "html-react-parser";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatFecha } from "@/lib/format";
import { StarIcon } from "@/components/ui/icons";
import type { ComunicadoCardProps } from "./card";

export function VerComunicado({
  comunicado,
  onClose,
}: {
  comunicado: Omit<ComunicadoCardProps, "puedeEditar" | "onEdit" | "size">;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <Card
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto p-0"
        onClick={(e) => e.stopPropagation()}
      >
        {comunicado.imagen && (
          <div className="relative h-56 w-full overflow-hidden">
            <Image
              src={comunicado.imagen}
              alt={comunicado.titulo}
              fill
              className="object-cover"
              sizes="700px"
            />
          </div>
        )}

        <div className="p-6">
          {comunicado.importante && (
            <div className="mb-3">
              <Badge tone="warning">
                <StarIcon className="h-3 w-3" />
                Importante
              </Badge>
            </div>
          )}

          <h2 className="text-xl font-bold text-foreground">{comunicado.titulo}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {comunicado.autor.name} · {formatFecha(comunicado.createdAt)}
          </p>

          <div className="prose prose-sm mt-4 max-w-none text-foreground">
            {parse(comunicado.contenido)}
          </div>

          <div className="mt-6 flex justify-end">
            <Button variant="secondary" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
