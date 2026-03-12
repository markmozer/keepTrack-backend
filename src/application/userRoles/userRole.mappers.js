/**
 * File: src/application/userRoles/userRole.mappers.js
 */


/**
 * @typedef {import("../ports/userRoles/userRole.types.js").UserRoleDtoPublic} UserRoleDtoPublic
 * @typedef {import("../ports/userRoles/userRole.types.js").UserRoleRowPublic} UserRoleRowPublic
 */


/**
 * @param {UserRoleRowPublic} row
 * @returns {UserRoleDtoPublic}
 */
export function toUserRoleDtoPublic(row) {
  return {
    id: row.id,
    tenantId: row.tenantId,
    userId: row.userId,
    roleId: row.roleId,
    validFrom: row.validFrom.toISOString(),
    validTo: row.validTo ? row.validTo.toISOString(): null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}