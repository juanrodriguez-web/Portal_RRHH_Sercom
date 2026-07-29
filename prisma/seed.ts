import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { PERMISSION_DESCRIPTIONS, PERMISSION_GROUPS } from "../src/lib/permissions";

const prisma = new PrismaClient({
  adapter: new PrismaPg(
    { connectionString: process.env.DATABASE_URL },
    { schema: process.env.DATABASE_SCHEMA || "public" }
  ),
});

const ANIO = new Date().getUTCFullYear();

async function main() {
  console.log("Sembrando catálogo de permisos…");
  for (const [code, description] of Object.entries(PERMISSION_DESCRIPTIONS)) {
    await prisma.permission.upsert({ where: { code }, create: { code, description }, update: { description } });
  }

  console.log("Sembrando plantillas de jornada…");
  const jornadaPartida = await prisma.jornadaPlantilla.upsert({
    where: { id: "seed-jornada-partida" },
    create: {
      id: "seed-jornada-partida",
      nombre: "Oficina — jornada partida",
      tipo: "PARTIDA",
      tieneTramo2: true,
      tramo1Inicio: 9 * 60,
      tramo1Fin: 14 * 60,
      tramo2Inicio: 15 * 60,
      tramo2Fin: 18 * 60,
      toleranciaEntradaMin: 10,
      toleranciaSalidaMin: 10,
    },
    update: {},
  });

  const jornadaContinua = await prisma.jornadaPlantilla.upsert({
    where: { id: "seed-jornada-continua" },
    create: {
      id: "seed-jornada-continua",
      nombre: "Comercial — jornada continua",
      tipo: "COMPLETA",
      tieneTramo2: false,
      tramo1Inicio: 8 * 60,
      tramo1Fin: 15 * 60,
      toleranciaEntradaMin: 10,
      toleranciaSalidaMin: 10,
    },
    update: {},
  });

  console.log("Sembrando festivos nacionales…");
  const festivosNacionales = [
    `${ANIO}-01-01`,
    `${ANIO}-01-06`,
    `${ANIO}-05-01`,
    `${ANIO}-08-15`,
    `${ANIO}-10-12`,
    `${ANIO}-11-01`,
    `${ANIO}-12-06`,
    `${ANIO}-12-08`,
    `${ANIO}-12-25`,
  ];
  for (const fecha of festivosNacionales) {
    await prisma.festivo.upsert({
      where: { fecha_ambito: { fecha: new Date(fecha), ambito: "NACIONAL" } },
      create: { fecha: new Date(fecha), nombre: "Festivo nacional", ambito: "NACIONAL" },
      update: {},
    });
  }

  console.log("Sembrando catálogo de tipos de ausencia (Anexo B)…");
  const tiposAusencia: { codigo: string; nombre: string; consumeSaldo: boolean; requiereJustificante: boolean; activo: boolean }[] = [
    { codigo: "VACACIONES", nombre: "Vacaciones", consumeSaldo: true, requiereJustificante: false, activo: true },
    { codigo: "ASUNTOS_PROPIOS", nombre: "Asuntos propios", consumeSaldo: false, requiereJustificante: false, activo: false },
    { codigo: "COMPENSACION_HORAS", nombre: "Compensación de horas", consumeSaldo: false, requiereJustificante: false, activo: false },
    { codigo: "BAJA_JUSTIFICADA", nombre: "Baja justificada", consumeSaldo: false, requiereJustificante: true, activo: false },
    { codigo: "BAJA_SIN_JUSTIFICAR", nombre: "Baja sin justificar", consumeSaldo: false, requiereJustificante: false, activo: false },
    { codigo: "DEBER_INEXCUSABLE", nombre: "Deber inexcusable", consumeSaldo: false, requiereJustificante: true, activo: false },
    { codigo: "MATERNIDAD_PATERNIDAD", nombre: "Maternidad/paternidad", consumeSaldo: false, requiereJustificante: true, activo: false },
    { codigo: "MATRIMONIO", nombre: "Matrimonio", consumeSaldo: false, requiereJustificante: true, activo: false },
    { codigo: "FALLECIMIENTO_FAMILIAR", nombre: "Fallecimiento familiar", consumeSaldo: false, requiereJustificante: true, activo: false },
  ];
  for (const t of tiposAusencia) {
    await prisma.tipoAusencia.upsert({ where: { codigo: t.codigo }, create: t, update: t });
  }

  console.log("Sembrando usuarios de demo…");
  console.log(
    "⚠️  Sustituye estos emails por cuentas REALES de vuestro tenant Microsoft 365 antes de probar el login (spec §9.2: solo usuarios pre-existentes pueden entrar)."
  );

  const laura = await prisma.user.upsert({
    where: { email: "laura.gomez@sercom.es" },
    create: { email: "laura.gomez@sercom.es", name: "Laura Gómez", departamento: "RRHH" },
    update: {},
  });
  const carlos = await prisma.user.upsert({
    where: { email: "carlos.ruiz@sercom.es" },
    create: { email: "carlos.ruiz@sercom.es", name: "Carlos Ruiz", departamento: "Comercial" },
    update: {},
  });
  const ana = await prisma.user.upsert({
    where: { email: "ana.torres@sercom.es" },
    create: { email: "ana.torres@sercom.es", name: "Ana Torres", departamento: "Administración", managerId: carlos.id },
    update: { managerId: carlos.id },
  });
  const marcos = await prisma.user.upsert({
    where: { email: "marcos.ibanez@sercom.es" },
    create: { email: "marcos.ibanez@sercom.es", name: "Marcos Ibáñez", departamento: "Administración", managerId: carlos.id },
    update: { managerId: carlos.id },
  });

  console.log("Asignando permisos por grupo (empleado/manager/rrhh)…");
  const asignarGrupo = async (userId: string, grupo: keyof typeof PERMISSION_GROUPS) => {
    for (const code of PERMISSION_GROUPS[grupo]) {
      await prisma.userPermission.upsert({
        where: { userId_permissionCode: { userId, permissionCode: code } },
        create: { userId, permissionCode: code },
        update: {},
      });
    }
  };
  await asignarGrupo(laura.id, "rrhh");
  await asignarGrupo(carlos.id, "manager");
  await asignarGrupo(ana.id, "empleado");
  await asignarGrupo(marcos.id, "empleado");

  console.log("Asignando jornadas vigentes…");
  const inicioAnio = new Date(Date.UTC(ANIO, 0, 1));
  const asignarJornada = async (userId: string, jornadaId: string) => {
    const existente = await prisma.asignacionJornada.findFirst({ where: { userId, jornadaId, vigenteDesde: inicioAnio } });
    if (!existente) {
      await prisma.asignacionJornada.create({ data: { userId, jornadaId, vigenteDesde: inicioAnio } });
    }
  };
  await asignarJornada(laura.id, jornadaPartida.id);
  await asignarJornada(ana.id, jornadaPartida.id);
  await asignarJornada(marcos.id, jornadaPartida.id);
  await asignarJornada(carlos.id, jornadaContinua.id);

  console.log("Sembrando saldos de vacaciones del año en curso…");
  for (const u of [laura, carlos, ana, marcos]) {
    await prisma.saldoVacaciones.upsert({
      where: { userId_anio: { userId: u.id, anio: ANIO } },
      create: { userId: u.id, anio: ANIO, totalAnual: 23, arrastre: 0 },
      update: {},
    });
  }

  console.log("Listo. Usuarios de demo:", [laura, carlos, ana, marcos].map((u) => u.email).join(", "));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
