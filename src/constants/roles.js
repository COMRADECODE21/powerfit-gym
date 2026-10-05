/**
 * Constantes de roles de usuario del sistema PowerFit GYM.
 * Solo el personal administrativo y operativo accede al sistema.
 */
export const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.STAFF]: 'Staff / Recepción',
};
