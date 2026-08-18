-- Ensure all active users can request vacations (solicitarVacaciones permission)
-- and have vacation allowance for the current year

-- Add solicitarVacaciones permission to all users without it
INSERT INTO "UserPermission" ("userId", "permissionCode")
SELECT u."id", 'solicitar_vacaciones'
FROM "User" u
WHERE u."estado" = 'ACTIVO'
  AND NOT EXISTS (
    SELECT 1 FROM "UserPermission" up
    WHERE up."userId" = u."id"
    AND up."permissionCode" = 'solicitar_vacaciones'
  );

-- Add cancelarVacacionesPropias permission to all users without it
INSERT INTO "UserPermission" ("userId", "permissionCode")
SELECT u."id", 'cancelar_vacaciones_propias'
FROM "User" u
WHERE u."estado" = 'ACTIVO'
  AND NOT EXISTS (
    SELECT 1 FROM "UserPermission" up
    WHERE up."userId" = u."id"
    AND up."permissionCode" = 'cancelar_vacaciones_propias'
  );

-- Add vacation allowance (23 days) to all users without it for current year
INSERT INTO "SaldoVacaciones" ("userId", "anio", "totalAnual", "arrastre")
SELECT u."id", EXTRACT(YEAR FROM NOW())::int, 23, 0
FROM "User" u
WHERE u."estado" = 'ACTIVO'
  AND NOT EXISTS (
    SELECT 1 FROM "SaldoVacaciones" sv
    WHERE sv."userId" = u."id"
    AND sv."anio" = EXTRACT(YEAR FROM NOW())::int
  )
ON CONFLICT ("userId", "anio") DO NOTHING;
