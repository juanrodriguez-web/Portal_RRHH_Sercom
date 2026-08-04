-- AlterTable
ALTER TABLE "JornadaPlantilla" ADD COLUMN     "horasSemana" DOUBLE PRECISION,
ALTER COLUMN "tramo1Inicio" DROP NOT NULL,
ALTER COLUMN "tramo1Fin" DROP NOT NULL;
