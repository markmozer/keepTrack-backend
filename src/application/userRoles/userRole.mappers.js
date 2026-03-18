/**
 * File: src/application/userRoles/userRole.mappers.js
 */


/**
 * @typedef {import("../ports/userRoles/userRole.types.js").UserRoleDto} UserRoleDto
 * @typedef {import("../ports/userRoles/userRole.types.js").UserRoleRow} UserRoleRow
 * 
 */


/**
 * @param {UserRoleRow} row
 * @returns {UserRoleDto}
 */
export function toUserRoleDto(row) {
  return {
    id: row.id,
    tenantId: row.tenantId,
    userId: row.userId,
    roleId: row.roleId,
    validFrom: row.validFrom.toISOString(),
    validTo: row.validTo ? row.validTo.toISOString(): null,
    roleName: row.role.name,
  };
}

