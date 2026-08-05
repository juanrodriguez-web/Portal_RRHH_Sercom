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

  console.log("Sembrando plantillas de jornada estándar…");

  // Jornadas estándar por horas/semana (sin horarios fijos, flexible)
  const jornada40 = await prisma.jornadaPlantilla.upsert({
    where: { id: "seed-jornada-40h" },
    create: {
      id: "seed-jornada-40h",
      nombre: "Jornada completa — 40 horas/semana",
      tipo: "COMPLETA",
      tieneTramo2: false,
      horasSemana: 40,
      // Sin horarios específicos: flexible
      toleranciaEntradaMin: 10,
      toleranciaSalidaMin: 10,
    },
    update: { nombre: "Jornada completa — 40 horas/semana", horasSemana: 40 },
  });

  const jornada37_5 = await prisma.jornadaPlantilla.upsert({
    where: { id: "seed-jornada-37.5h" },
    create: {
      id: "seed-jornada-37.5h",
      nombre: "Jornada partida — 37.5 horas/semana",
      tipo: "PARTIDA",
      tieneTramo2: true,
      horasSemana: 37.5,
      // Sin horarios específicos: pausa flexible a criterio del empleado
      toleranciaEntradaMin: 10,
      toleranciaSalidaMin: 10,
    },
    update: { nombre: "Jornada partida — 37.5 horas/semana", horasSemana: 37.5 },
  });

  const jornada35 = await prisma.jornadaPlantilla.upsert({
    where: { id: "seed-jornada-35h" },
    create: {
      id: "seed-jornada-35h",
      nombre: "Jornada reducida — 35 horas/semana",
      tipo: "PARCIAL",
      tieneTramo2: false,
      horasSemana: 35,
      // Sin horarios específicos: flexible
      toleranciaEntradaMin: 10,
      toleranciaSalidaMin: 10,
    },
    update: { nombre: "Jornada reducida — 35 horas/semana", horasSemana: 35 },
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
  const juan = await prisma.user.upsert({
    where: { email: "juan.rodriguez@sercomsoluciones.es" },
    create: { email: "juan.rodriguez@sercomsoluciones.es", name: "Juan Gastón Rodríguez", departamento: "IT" },
    update: {},
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
  await asignarGrupo(juan.id, "empleado");

  console.log("Asignando jornadas vigentes…");
  const inicioAnio = new Date(Date.UTC(ANIO, 0, 1));
  const asignarJornada = async (userId: string, jornadaId: string) => {
    const existente = await prisma.asignacionJornada.findFirst({ where: { userId, jornadaId, vigenteDesde: inicioAnio } });
    if (!existente) {
      await prisma.asignacionJornada.create({ data: { userId, jornadaId, vigenteDesde: inicioAnio } });
    }
  };
  // Laura (RRHH): 37.5h partida
  await asignarJornada(laura.id, jornada37_5.id);
  // Ana, Marcos y Juan (empleados): 37.5h partida
  await asignarJornada(ana.id, jornada37_5.id);
  await asignarJornada(marcos.id, jornada37_5.id);
  await asignarJornada(juan.id, jornada37_5.id);
  // Carlos (manager/comercial): 40h
  await asignarJornada(carlos.id, jornada40.id);

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
