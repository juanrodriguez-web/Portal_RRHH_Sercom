import Link from "next/link";
import { ShieldIcon } from "@/components/ui/icons";

export const metadata = {
  title: "Sin permiso",
};

export default function SinPermisoPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-danger-tint text-danger">
        <ShieldIcon className="h-7 w-7" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-foreground">No tienes permiso para ver esta página</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Si crees que deberías tener acceso, contacta con RRHH para que revisen tu rol.
        </p>
      </div>
      <Link
        href="/inicio"
        className="mt-2 rounded-[var(--radius-control)] bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover"
      >
        Volver a Inicio
      </Link>
    </div>
  );
}
