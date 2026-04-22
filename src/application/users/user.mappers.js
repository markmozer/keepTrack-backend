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
 * @param {import("../ports/users/user.types.js").UserDetailRow} row
 * @returns {import("../ports/users/user.types.js").UserDetailDto}
 */
export function toUserDetailDto(row) {
  return {
    id: row.id,
    tenantId: row.tenantId,
    email: row.email,
    status: row.status,
    userRoles: row.userRoles.map((userRole) => ({
      id: userRole.id,
      roleId: userRole.roleId,
      validFrom: userRole.validFrom.toISOString(),
      validTo: userRole.validTo ? userRole.validTo.toISOString() : null,
      createdAt: userRole.createdAt.toISOString(),
      updatedAt: userRole.updatedAt.toISOString(),
      roleName: userRole.role.name,
    })),
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
