/**
 * File: src/application/users/user.mappers.js
 */

/**
 * @typedef {import("../ports/users/user.types.js").UserDtoPublic} UserDtoPublic
 * @typedef {import("../ports/users/user.types.js").UserDtoPublicWithRoles} UserDtoPublicWithRoles
 * @typedef {import("../ports/users/user.types.js").UserRowPublic} UserRowPublic
 * @typedef {import("../ports/users/user.types.js").UserRowPublicWithRoles} UserRowPublicWithRoles
 */

/**
 * @param {UserRowPublic} row
 * @returns {UserDtoPublic}
 */
export function toUserDtoPublic(row) {
  return {
    id: row.id,
    tenantId: row.tenantId,
    email: row.email,
    inviteTokenExpiresAt: row.inviteTokenExpiresAt
      ? row.inviteTokenExpiresAt.toISOString()
      : null,
    resetTokenExpiresAt: row.resetTokenExpiresAt
      ? row.resetTokenExpiresAt.toISOString()
      : null,
    status: row.status,
  };
}

/**
 * @param {UserRowPublicWithRoles} row
 * @returns {UserDtoPublicWithRoles}
 */
export function toUserDtoPublicWithRoles(row) {
  return {
    id: row.id,
    tenantId: row.tenantId,
    email: row.email,
    inviteTokenExpiresAt: row.inviteTokenExpiresAt
      ? row.inviteTokenExpiresAt.toISOString()
      : null,
    resetTokenExpiresAt: row.resetTokenExpiresAt
      ? row.resetTokenExpiresAt.toISOString()
      : null,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    roles: row.userRoles.map((ur) => ({
      id: ur.role.id,
      name: ur.role.name,
    })),
  };
}
