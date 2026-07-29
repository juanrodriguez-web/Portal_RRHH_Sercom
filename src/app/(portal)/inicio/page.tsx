import Link from "next/link";
import { requireUser } from "@/lib/authz";
import {
  computeEstadoJornada,
  getAccionEsperada,
  getFechaLaboral,
  getJornadaVigente,
  getMarcacionesDelDia,
  minutosTrabajados,
} from "@/lib/fichajes";
import { prisma } from "@/lib/prisma";
import { getResumenSaldo } from "@/lib/vacaciones";
import { RelojFichaje } from "@/components/fichajes/reloj-fichaje";
import { AvisoFichaje } from "@/components/fichajes/aviso-fichaje";
import { Card } from "@/components/ui/card";
import { formatFecha } from "@/lib/format";

export default async function InicioPage() {
  const user = await requireUser();
  const dbUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });

  const ahora = new Date();
  const jornada = await getJornadaVigente(user.id, ahora);
  const fechaLaboralHoy = getFechaLaboral(ahora, "NO_INICIADA");
  const marcacionesHoy = jornada ? await getMarcacionesDelDia(user.id, fechaLaboralHoy) : [];
  const estado = jornada ? computeEstadoJornada(marcacionesHoy, jornada) : "NO_INICIADA";
  const accion = jornada ? getAccionEsperada(estado, jornada) : null;

  const resumenSaldo = await getResumenSaldo(user.id, ahora.getUTCFullYear());
  const disponibles = resumenSaldo.saldoId ? resumenSaldo.disponible : null;

  const hora = ahora.getHours();
  const saludo = hora < 13 ? "Buenos días" : hora < 20 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="flex flex-col gap-6">
      <AvisoFichaje accionPendiente={!!accion} etiquetaAccion={accion?.etiqueta} />

      <Card className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-tint-strong text-lg font-bold text-brand">
          {dbUser.name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">
            {saludo}, {dbUser.name.split(" ")[0]}!
          </h1>
          <p className="text-sm capitalize text-muted-foreground">{formatFecha(ahora)}</p>
        </div>
        {dbUser.departamento ? (
          <span className="ml-auto rounded-full bg-border px-3 py-1 text-xs font-semibold text-muted-foreground">
            {dbUser.departamento}
          </span>
        ) : null}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {jornada ? (
          <RelojFichaje
            estadoInicial={estado}
            accion={accion}
            minutosTrabajadosInicial={minutosTrabajados(marcacionesHoy)}
          />
        ) : (
          <Card>
            <p className="text-sm text-muted-foreground">Aún no tienes jornada asignada.</p>
          </Card>
        )}

        <Card className="flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-foreground">Vacaciones</h2>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {disponibles !== null ? disponibles : "—"}
              <span className="ml-1 text-sm font-normal text-muted-foreground">días disponibles</span>
            </p>
          </div>
          <Link
            href="/vacaciones"
            className="mt-4 self-start text-sm font-semibold text-brand hover:underline"
          >
            Solicitar vacaciones →
          </Link>
        </Card>
      </div>
    </div>
  );
}
