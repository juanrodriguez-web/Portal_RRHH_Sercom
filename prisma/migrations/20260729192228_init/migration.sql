-- CreateEnum
CREATE TYPE "EstadoUsuario" AS ENUM ('ACTIVO', 'BAJA');

-- CreateEnum
CREATE TYPE "CanalOrigen" AS ENUM ('PORTAL_RRHH', 'APP_SERCOM', 'ADMIN_CORRECCION', 'IMPORTACION');

-- CreateEnum
CREATE TYPE "TipoMarcacion" AS ENUM ('ENTRADA', 'SALIDA');

-- CreateEnum
CREATE TYPE "EstadoCorreccion" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "TipoMovimientoSaldo" AS ENUM ('CARGA_INICIAL', 'DEVENGO', 'RESERVA', 'APROBACION', 'LIBERACION_RESERVA', 'ANULACION', 'AJUSTE', 'CADUCIDAD');

-- CreateEnum
CREATE TYPE "EstadoSolicitud" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA', 'CANCELADA');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "azureAdId" TEXT,
    "departamento" TEXT,
    "managerId" TEXT,
    "estado" "EstadoUsuario" NOT NULL DEFAULT 'ACTIVO',
    "fechaAlta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaBaja" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "UserPermission" (
    "userId" TEXT NOT NULL,
    "permissionCode" TEXT NOT NULL,

    CONSTRAINT "UserPermission_pkey" PRIMARY KEY ("userId","permissionCode")
);

-- CreateTable
CREATE TABLE "JornadaPlantilla" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "tieneTramo2" BOOLEAN NOT NULL DEFAULT true,
    "tramo1Inicio" INTEGER NOT NULL,
    "tramo1Fin" INTEGER NOT NULL,
    "tramo2Inicio" INTEGER,
    "tramo2Fin" INTEGER,
    "toleranciaEntradaMin" INTEGER NOT NULL DEFAULT 10,
    "toleranciaSalidaMin" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JornadaPlantilla_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AsignacionJornada" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jornadaId" TEXT NOT NULL,
    "vigenteDesde" TIMESTAMP(3) NOT NULL,
    "vigenteHasta" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AsignacionJornada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Festivo" (
    "id" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "nombre" TEXT NOT NULL,
    "ambito" TEXT NOT NULL,

    CONSTRAINT "Festivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Marcacion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tipo" "TipoMarcacion" NOT NULL,
    "tramo" INTEGER NOT NULL,
    "timestampServidor" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaLaboral" DATE NOT NULL,
    "canalOrigen" "CanalOrigen" NOT NULL DEFAULT 'PORTAL_RRHH',
    "esIncidencia" BOOLEAN NOT NULL DEFAULT false,
    "idempotencyKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Marcacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CorreccionMarcacion" (
    "id" TEXT NOT NULL,
    "marcacionId" TEXT NOT NULL,
    "valorAnterior" TIMESTAMP(3) NOT NULL,
    "valorPropuesto" TIMESTAMP(3) NOT NULL,
    "motivo" TEXT NOT NULL,
    "estado" "EstadoCorreccion" NOT NULL DEFAULT 'PENDIENTE',
    "solicitanteId" TEXT NOT NULL,
    "aprobadorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resueltoAt" TIMESTAMP(3),

    CONSTRAINT "CorreccionMarcacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoAusencia" (
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "consumeSaldo" BOOLEAN NOT NULL DEFAULT true,
    "unidad" TEXT NOT NULL DEFAULT 'DIAS_LABORABLES',
    "requiereJustificante" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TipoAusencia_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "SaldoVacaciones" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "totalAnual" DOUBLE PRECISION NOT NULL,
    "arrastre" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SaldoVacaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimientoSaldo" (
    "id" TEXT NOT NULL,
    "saldoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tipo" "TipoMovimientoSaldo" NOT NULL,
    "cantidad" DOUBLE PRECISION NOT NULL,
    "solicitudId" TEXT,
    "motivo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimientoSaldo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolicitudAusencia" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tipoAusenciaCodigo" TEXT NOT NULL,
    "fechaInicio" DATE NOT NULL,
    "fechaFin" DATE NOT NULL,
    "dias" DOUBLE PRECISION NOT NULL,
    "comentario" TEXT,
    "estado" "EstadoSolicitud" NOT NULL DEFAULT 'PENDIENTE',
    "aprobadorId" TEXT,
    "motivoResolucion" TEXT,
    "esExcepcionSinManager" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resueltoAt" TIMESTAMP(3),

    CONSTRAINT "SolicitudAusencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecordatorioFichaje" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "tipo" TEXT NOT NULL,
    "ultimoEnvio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecordatorioFichaje_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT NOT NULL,
    "valoresAntes" JSONB,
    "valoresDespues" JSONB,
    "motivo" TEXT,
    "origenTecnico" TEXT NOT NULL DEFAULT 'PORTAL_RRHH',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_azureAdId_key" ON "User"("azureAdId");

-- CreateIndex
CREATE INDEX "User_managerId_idx" ON "User"("managerId");

-- CreateIndex
CREATE INDEX "User_departamento_idx" ON "User"("departamento");

-- CreateIndex
CREATE INDEX "AsignacionJornada_userId_vigenteDesde_idx" ON "AsignacionJornada"("userId", "vigenteDesde");

-- CreateIndex
CREATE UNIQUE INDEX "Festivo_fecha_ambito_key" ON "Festivo"("fecha", "ambito");

-- CreateIndex
CREATE UNIQUE INDEX "Marcacion_idempotencyKey_key" ON "Marcacion"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Marcacion_userId_fechaLaboral_idx" ON "Marcacion"("userId", "fechaLaboral");

-- CreateIndex
CREATE INDEX "CorreccionMarcacion_marcacionId_idx" ON "CorreccionMarcacion"("marcacionId");

-- CreateIndex
CREATE UNIQUE INDEX "SaldoVacaciones_userId_anio_key" ON "SaldoVacaciones"("userId", "anio");

-- CreateIndex
CREATE INDEX "MovimientoSaldo_saldoId_idx" ON "MovimientoSaldo"("saldoId");

-- CreateIndex
CREATE INDEX "MovimientoSaldo_userId_idx" ON "MovimientoSaldo"("userId");

-- CreateIndex
CREATE INDEX "SolicitudAusencia_userId_idx" ON "SolicitudAusencia"("userId");

-- CreateIndex
CREATE INDEX "SolicitudAusencia_estado_idx" ON "SolicitudAusencia"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");

-- CreateIndex
CREATE INDEX "PushSubscription_userId_idx" ON "PushSubscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RecordatorioFichaje_userId_fecha_tipo_key" ON "RecordatorioFichaje"("userId", "fecha", "tipo");

-- CreateIndex
CREATE INDEX "AuditLog_entidad_entidadId_idx" ON "AuditLog"("entidad", "entidadId");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_permissionCode_fkey" FOREIGN KEY ("permissionCode") REFERENCES "Permission"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionJornada" ADD CONSTRAINT "AsignacionJornada_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionJornada" ADD CONSTRAINT "AsignacionJornada_jornadaId_fkey" FOREIGN KEY ("jornadaId") REFERENCES "JornadaPlantilla"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Marcacion" ADD CONSTRAINT "Marcacion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorreccionMarcacion" ADD CONSTRAINT "CorreccionMarcacion_marcacionId_fkey" FOREIGN KEY ("marcacionId") REFERENCES "Marcacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorreccionMarcacion" ADD CONSTRAINT "CorreccionMarcacion_solicitanteId_fkey" FOREIGN KEY ("solicitanteId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorreccionMarcacion" ADD CONSTRAINT "CorreccionMarcacion_aprobadorId_fkey" FOREIGN KEY ("aprobadorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaldoVacaciones" ADD CONSTRAINT "SaldoVacaciones_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoSaldo" ADD CONSTRAINT "MovimientoSaldo_saldoId_fkey" FOREIGN KEY ("saldoId") REFERENCES "SaldoVacaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoSaldo" ADD CONSTRAINT "MovimientoSaldo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoSaldo" ADD CONSTRAINT "MovimientoSaldo_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "SolicitudAusencia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudAusencia" ADD CONSTRAINT "SolicitudAusencia_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudAusencia" ADD CONSTRAINT "SolicitudAusencia_tipoAusenciaCodigo_fkey" FOREIGN KEY ("tipoAusenciaCodigo") REFERENCES "TipoAusencia"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudAusencia" ADD CONSTRAINT "SolicitudAusencia_aprobadorId_fkey" FOREIGN KEY ("aprobadorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecordatorioFichaje" ADD CONSTRAINT "RecordatorioFichaje_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
