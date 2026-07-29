import { Badge } from "@/components/ui/badge";
import { formatFechaCorta, formatHora, formatMinutos } from "@/lib/format";

export type FilaHistorico = {
  fecha: Date;
  entradaManana: Date | null;
  salidaManana: Date | null;
  entradaTarde: Date | null;
  salidaTarde: Date | null;
  totalMinutos: number;
  corregida: boolean;
  estado: "OK" | "INCOMPLETO" | "AUSENCIA";
  empleado?: string;
};

const ESTADO_TONE = { OK: "success", INCOMPLETO: "warning", AUSENCIA: "info" } as const;

export function HistoricoTable({ filas, mostrarEmpleado = false }: { filas: FilaHistorico[]; mostrarEmpleado?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            {mostrarEmpleado ? <th className="py-2 pr-4">Empleado</th> : null}
            <th className="py-2 pr-4">Día</th>
            <th className="py-2 pr-4">E. mañana</th>
            <th className="py-2 pr-4">S. mañana</th>
            <th className="py-2 pr-4">E. tarde</th>
            <th className="py-2 pr-4">S. tarde</th>
            <th className="py-2 pr-4">Total</th>
            <th className="py-2 pr-4">Estado</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((fila, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              {mostrarEmpleado ? <td className="py-2 pr-4">{fila.empleado}</td> : null}
              <td className="py-2 pr-4 capitalize">{formatFechaCorta(fila.fecha)}</td>
              <td className="py-2 pr-4">{formatHora(fila.entradaManana)}</td>
              <td className="py-2 pr-4">{formatHora(fila.salidaManana)}</td>
              <td className="py-2 pr-4">{formatHora(fila.entradaTarde)}</td>
              <td className="py-2 pr-4">{formatHora(fila.salidaTarde)}</td>
              <td className="py-2 pr-4 font-medium">{formatMinutos(fila.totalMinutos)}</td>
              <td className="py-2 pr-4">
                <div className="flex items-center gap-1.5">
                  <Badge tone={ESTADO_TONE[fila.estado]}>{fila.estado}</Badge>
                  {fila.corregida ? <Badge tone="brand">corregida</Badge> : null}
                </div>
              </td>
            </tr>
          ))}
          {filas.length === 0 ? (
            <tr>
              <td colSpan={mostrarEmpleado ? 8 : 7} className="py-6 text-center text-muted-foreground">
                Sin registros en este periodo.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
