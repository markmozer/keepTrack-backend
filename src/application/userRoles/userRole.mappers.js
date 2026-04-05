/**
 * File: src/application/userRoles/userRole.mappers.js
 */


/**
 * @typedef {import("../ports/userRoles/userRole.types.js").UserRoleDto} UserRoleDto
 * @typedef {import("../ports/userRoles/userRole.types.js").UserRoleRow} UserRoleRow
 * @typedef {import("../ports/userRoles/userRole.types.js").UserRoleAdminDto} UserRoleAdminDto
 * @typedef {import("../ports/userRoles/userRole.types.js").UserRoleAdminRow} UserRoleAdminRow
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

/**
 * @param {UserRoleAdminRow} row
 * @returns {UserRoleAdminDto}
 */
export function toUserRoleAdminDto(row) {
  return {
    id: row.id,
    tenantId: row.tenantId,
    userId: row.userId,
    roleId: row.roleId,
    validFrom: row.validFrom.toISOString(),
    validTo: row.validTo ? row.validTo.toISOString(): null,
    createdAt: row.createdAt.toDateString(),
    updatedAt: row.updatedAt.toISOString(),
    roleName: row.role.name,
  };
}

