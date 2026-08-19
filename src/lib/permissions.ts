// Catálogo de permisos (spec §4.3). La autorización nunca depende de un
// campo "rol": todo se resuelve consultando estos códigos contra la tabla
// UserPermission. Los "grupos" de abajo son solo presets de conveniencia
// para dar de alta usuarios rápido — no existen como concepto en el backend.

export const PERMISSIONS = {
  registrarFichajePropio: "registrar_fichaje_propio",
  verFichajePropio: "ver_fichaje_propio",
  solicitarCorreccionPropia: "solicitar_correccion_propia",
  verFichajeEquipo: "ver_fichaje_equipo",
  corregirFichajeEquipo: "corregir_fichaje_equipo",
  verFichajeGlobal: "ver_fichaje_global",
  corregirFichajeGlobal: "corregir_fichaje_global",
  exportarFichajes: "exportar_fichajes",

  solicitarVacaciones: "solicitar_vacaciones",
  cancelarVacacionesPropias: "cancelar_vacaciones_propias",
  verVacacionesEquipo: "ver_vacaciones_equipo",
  aprobarVacacionesEquipo: "aprobar_vacaciones_equipo",
  verVacacionesGlobal: "ver_vacaciones_global",
  aprobarVacacionesGlobal: "aprobar_vacaciones_global",
  editarSaldos: "editar_saldos",
  gestionarCatalogoAusencias: "gestionar_catalogo_ausencias",

  verUsuarios: "ver_usuarios",
  gestionarUsuariosRrhh: "gestionar_usuarios_rrhh",
  gestionarJornadas: "gestionar_jornadas",
  gestionarCalendarios: "gestionar_calendarios",
  verAuditoria: "ver_auditoria",

  verComunicados: "ver_comunicados",
  crearComunicados: "crear_comunicados",
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const PERMISSION_DESCRIPTIONS: Record<PermissionCode, string> = {
  [PERMISSIONS.registrarFichajePropio]: "Crear marcaciones propias.",
  [PERMISSIONS.verFichajePropio]: "Consultar registros propios.",
  [PERMISSIONS.solicitarCorreccionPropia]: "Solicitar rectificación de un fichaje propio.",
  [PERMISSIONS.verFichajeEquipo]: "Consultar registros del equipo.",
  [PERMISSIONS.corregirFichajeEquipo]: "Crear correcciones auditadas del equipo.",
  [PERMISSIONS.verFichajeGlobal]: "Consultar registros globales.",
  [PERMISSIONS.corregirFichajeGlobal]: "Corregir registros globales.",
  [PERMISSIONS.exportarFichajes]: "Exportar información de fichajes dentro del ámbito autorizado.",
  [PERMISSIONS.solicitarVacaciones]: "Crear solicitudes propias.",
  [PERMISSIONS.cancelarVacacionesPropias]: "Cancelar según las reglas de estado.",
  [PERMISSIONS.verVacacionesEquipo]: "Consultar solicitudes/calendario del equipo.",
  [PERMISSIONS.aprobarVacacionesEquipo]: "Aprobar o rechazar solicitudes del equipo.",
  [PERMISSIONS.verVacacionesGlobal]: "Consultar solicitudes globales.",
  [PERMISSIONS.aprobarVacacionesGlobal]: "Tramitar solicitudes globales como RRHH.",
  [PERMISSIONS.editarSaldos]: "Crear movimientos manuales de saldo.",
  [PERMISSIONS.gestionarCatalogoAusencias]: "Administrar tipos y reglas de ausencia.",
  [PERMISSIONS.verUsuarios]: "Consultar datos organizativos.",
  [PERMISSIONS.gestionarUsuariosRrhh]: "Editar atributos RRHH permitidos.",
  [PERMISSIONS.gestionarJornadas]: "Administrar plantillas y asignaciones de jornada.",
  [PERMISSIONS.gestionarCalendarios]: "Administrar festivos y calendarios.",
  [PERMISSIONS.verAuditoria]: "Consultar el registro de auditoría.",
  [PERMISSIONS.verComunicados]: "Ver comunicados.",
  [PERMISSIONS.crearComunicados]: "Crear y gestionar comunicados.",
};

// Presets de alta de usuario — no son roles en el sentido de autorización,
// solo listas de permisos que se copian a UserPermission al crear el usuario.
export const PERMISSION_GROUPS: Record<string, PermissionCode[]> = {
  empleado: [
    PERMISSIONS.registrarFichajePropio,
    PERMISSIONS.verFichajePropio,
    PERMISSIONS.solicitarCorreccionPropia,
    PERMISSIONS.solicitarVacaciones,
    PERMISSIONS.cancelarVacacionesPropias,
    PERMISSIONS.verComunicados,
    PERMISSIONS.verUsuarios,
  ],
  manager: [
    PERMISSIONS.registrarFichajePropio,
    PERMISSIONS.verFichajePropio,
    PERMISSIONS.solicitarCorreccionPropia,
    PERMISSIONS.solicitarVacaciones,
    PERMISSIONS.cancelarVacacionesPropias,
    PERMISSIONS.verFichajeEquipo,
    PERMISSIONS.corregirFichajeEquipo,
    PERMISSIONS.verVacacionesEquipo,
    PERMISSIONS.aprobarVacacionesEquipo,
    PERMISSIONS.verComunicados,
    PERMISSIONS.crearComunicados,
    PERMISSIONS.verUsuarios,
  ],
  rrhh: Object.values(PERMISSIONS),
};

export const DEFAULT_PERMISSIONS = PERMISSION_GROUPS.empleado;

export type GrupoDetectado = "empleado" | "manager" | "rrhh" | "custom" | "";

// Compara el set exacto de permisos de un usuario contra cada PERMISSION_GROUPS.
// "custom" = tiene permisos pero no coinciden exactamente con ningun grupo estandar.
export function detectarGrupoUsuario(permisos: { permissionCode: string }[]): GrupoDetectado {
  if (permisos.length === 0) return "";
  const codes = new Set(permisos.map((p) => p.permissionCode));
  for (const [grupo, codigosGrupo] of Object.entries(PERMISSION_GROUPS)) {
    if (codigosGrupo.length === codes.size && codigosGrupo.every((c) => codes.has(c))) {
      return grupo as "empleado" | "manager" | "rrhh";
    }
  }
  return "custom";
}
