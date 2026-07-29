# Portal RRHH SERCOM — piloto independiente

Piloto de un portal RRHH web independiente (Fichajes, Vacaciones, Avisos de
fichaje y Panel RRHH básico), construido como alternativa evaluable frente al
desarrollo cotizado por el proveedor de Sergest V3. Ver la especificación
funcional completa en `../Especificacion_Funcional_Portal_RRHH_SERCOM_v1.0.docx`
(carpeta superior).

## Alcance de este piloto (no es producción)

Incluido: Fichajes (marcación, histórico, equipo, global, corrección), Avisos
de fichaje (banner + Web Push + recordatorio programado), Vacaciones (saldo,
solicitud, aprobación, cancelación), Panel RRHH básico (dashboard, usuarios,
exportación Excel).

Explícitamente fuera (fase 2 si se decide continuar): Comunicados/anuncios,
Notification API avanzada, catálogo completo de tipos de ausencia, auditoría
de cumplimiento profunda, integración real con la app SERCOM de comerciales,
migración de datos reales, retención legal de 4 años.

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Prisma 7** (driver adapter `@prisma/adapter-pg`) sobre **PostgreSQL (Supabase)**
- **Auth.js v5** con proveedor **Microsoft Entra ID** (SSO corporativo), sesión JWT
- **Web Push** (VAPID) + Service Worker propio (`public/sw.js`) para los avisos de fichaje
- **ExcelJS** para las exportaciones
- Despliegue objetivo: **Vercel**

No se usa el adaptador de Prisma para Auth.js (`@auth/prisma-adapter`): el
modelo `User` es el propio dominio de negocio, no el de Auth.js. El login
verifica que el email ya exista como usuario activo (spec §9.2) antes de
autorizar la sesión — no hay alta automática por login.

## Arquitectura de permisos

No hay roles hardcodeados. Todo se resuelve contra la tabla `Permission` +
`UserPermission` (ver `src/lib/permissions.ts` para el catálogo completo y
`src/lib/authz.ts` para `requirePermission()`, usado en cada Server Action y
Route Handler). El sidebar (`src/app/(portal)/layout.tsx`) se construye
dinámicamente a partir de los permisos de la sesión. `PERMISSION_GROUPS`
(empleado/manager/rrhh) son solo presets de alta rápida, no un concepto que
exista en la capa de autorización.

## Puesta en marcha local

```bash
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### Variables de entorno necesarias (`.env`)

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Postgres **pooled** (transaction mode, puerto 6543) — la usa la app en runtime |
| `DIRECT_URL` | Postgres **directa** (puerto 5432) — la usa Prisma CLI para migraciones |
| `DATABASE_SCHEMA` | Nombre del schema Postgres a usar (ver nota de aislamiento abajo) |
| `AUTH_SECRET` | Secreto de Auth.js (`npx auth secret` para generarlo) |
| `AUTH_MICROSOFT_ENTRA_ID_ID` / `_SECRET` / `_ISSUER` | App Registration en Entra ID (ver más abajo) |
| `AUTH_ENABLE_DEMO_LOGIN` | `"true"` habilita el selector "Entrar como demo" en /login (sin contraseña, elige cualquier usuario semilla). **Poner en `"false"` o quitar en el despliegue real** |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` | Par de claves Web Push (`npx web-push generate-vapid-keys`) |
| `CRON_SECRET` | Protege el endpoint `/api/cron/avisos-fichaje` |

### ⚠️ Aislamiento en Supabase compartido

Si esta app comparte proyecto Supabase con otras aplicaciones (como en el
piloto: el mismo proyecto ya tenía tablas de otro producto en `public`), las
tablas del Portal RRHH se crean en un schema Postgres separado
(`portal_rrhh`) para no tocar nada existente:

1. Crear el schema una vez: `CREATE SCHEMA IF NOT EXISTS portal_rrhh;`
2. Añadir `&schema=portal_rrhh` (pooled) / `?schema=portal_rrhh` (directa) al
   final de `DATABASE_URL` / `DIRECT_URL` — esto lo respeta el motor de
   migraciones de Prisma.
3. Establecer `DATABASE_SCHEMA="portal_rrhh"` — **esto es necesario aparte**,
   porque el adaptador `@prisma/adapter-pg` que usa la app en runtime NO lee
   el `?schema=` de la URL (esa lectura es exclusiva del motor de
   migraciones); `src/lib/prisma.ts` y `prisma/seed.ts` pasan
   `{ schema: process.env.DATABASE_SCHEMA }` explícitamente al adapter.

Si en el futuro este proyecto tiene su propio proyecto Supabase dedicado,
basta con quitar el `?schema=` de las URLs y dejar `DATABASE_SCHEMA` vacío
(usa `"public"` por defecto).

### Alta de la App Registration en Entra ID

Azure Portal → **Microsoft Entra ID → App registrations → New registration**
(no "Enterprise applications"). Tipo de cuenta "Single tenant". Redirect URI
tipo **Web**: `https://<tu-dominio>/api/auth/callback/microsoft-entra-id`.
Generar un Client Secret en "Certificates & secrets". De ahí salen
`AUTH_MICROSOFT_ENTRA_ID_ID` (Application/client ID), `_ISSUER`
(`https://login.microsoftonline.com/<Tenant ID>/v2.0`) y `_SECRET`.

## Datos de partida (`prisma/seed.ts`)

El seed crea el catálogo de permisos, dos plantillas de jornada (partida y
continua), festivos nacionales del año en curso, el catálogo de tipos de
ausencia del Anexo B (solo `VACACIONES` activo) y **4 usuarios ficticios**
(Laura RRHH, Carlos manager, Ana y Marcos empleados).

**Antes de poder iniciar sesión de verdad**, sustituye los emails de esos 4
usuarios en `prisma/seed.ts` por cuentas reales del tenant de Microsoft 365 de
SERCOM — el login solo deja entrar a usuarios que ya existen en la tabla
`User` (spec §9.2), no da de alta a nadie automáticamente.

## Despliegue (Vercel + Supabase)

1. `vercel link` / importar el repo en Vercel.
2. Configurar en Vercel todas las variables de entorno de la tabla de arriba.
3. `npx prisma migrate deploy` (o dejar que el build lo haga si se añade al
   comando de build).

### ⚠️ Limitación del cron en el plan gratuito de Vercel

`vercel.json` programa `/api/cron/avisos-fichaje` cada 5 minutos en horario
laboral. **El plan Hobby de Vercel limita los Cron Jobs a una ejecución al
día.** Para que los avisos funcionen con la cadencia que pide la spec (cada
pocos minutos) hace falta plan Pro, o bien un disparador externo (por ejemplo
un GitHub Action programado, o cron-job.org) que llame a ese endpoint con la
cabecera `Authorization: Bearer <CRON_SECRET>`.

## Estructura relevante

```
prisma/schema.prisma        Modelo de datos completo
prisma/seed.ts               Datos de partida (permisos, jornadas, usuarios demo)
src/lib/permissions.ts       Catálogo de permisos + grupos preset
src/lib/authz.ts             requirePermission(), getEquipoIds(), etc.
src/lib/fichajes.ts          Máquina de estados de jornada (spec §6.2) y derivados
src/lib/vacaciones.ts        Cálculo de saldo/solapamiento (spec §7.3/§7.4)
src/lib/push.ts              Envío de Web Push
src/app/(portal)/            Rutas autenticadas (Inicio, Fichajes, Vacaciones, Panel RRHH)
src/app/api/cron/            Job programado de avisos de fichaje
src/app/api/*/export/        Exportaciones Excel
public/sw.js                 Service worker de Web Push
```

## Roadmap si se decide continuar (fase 2)

Comunicados/anuncios completos · Notification API con más granularidad ·
delegación de aprobador · auditoría de cumplimiento profunda (conservación 4
años, clasificación documental) · catálogo completo de tipos de ausencia con
validación Legal/Laboral · integración real con la app SERCOM de comerciales
(requiere cooperación del proveedor actual de Sergest V3) · migración de
datos reales de plantilla.
