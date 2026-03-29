/**
 * File: src/application/users/user.mappers.js
 */

/**
 * @param {import("../ports/users/user.types.js").UserRow} row
 * @returns {import("../ports/users/user.types.js").UserDto}
 */
export function toUserDto(row) {
  return {
    id: row.id,
    tenantId: row.tenantId,
    email: row.email,
    status: row.status,
    roleNames: row.userRoles.map((ur) => ur.role.name),
  };
}

/**
 * @param {import("../ports/users/user.types.js").UserAdminRow} row
 * @returns {import("../ports/users/user.types.js").UserAdminDto}
 */
export function toUserAdminDto(row) {
  return {
    id: row.id,
    tenantId: row.tenantId,
    email: row.email,
    status: row.status,
    roleNames: row.userRoles.map((ur) => ur.role.name),
    inviteTokenExpiresAt: row.inviteTokenExpiresAt
      ? row.inviteTokenExpiresAt.toISOString()
      : null,
    resetTokenExpiresAt: row.resetTokenExpiresAt
      ? row.resetTokenExpiresAt.toISOString()
      : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
