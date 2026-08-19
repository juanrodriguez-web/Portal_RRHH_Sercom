import { Breadcrumb } from "@/components/ui/breadcrumb";
import { obtenerMiOrganigrama } from "./actions";
import { MiOrganigrama } from "@/components/organigrama/mi-organigrama";

export const metadata = {
  title: "Organigrama",
  description: "Visualiza tu posición en la estructura organizacional",
};

export default async function OrganigramaPage() {
  const miOrganigrama = await obtenerMiOrganigrama();

  return (
    <div className="space-y-8">
      <Breadcrumb items={[{ label: "Organigrama" }]} />

      <div>
        <h1 className="text-3xl font-bold text-foreground">Organigrama de la empresa</h1>
        <p className="text-muted-foreground mt-2">Tu posición en la jerarquía, cadena de mando y equipo</p>
      </div>

      <MiOrganigrama inicial={miOrganigrama} />
    </div>
  );
}
