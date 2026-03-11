/**
 * File: src/application/roles/role.mappers.js
 */

/**
 * @typedef {import("../ports/roles/role.types.js").RoleDto} RoleDto
 * @typedef {import("../ports/roles/role.types.js").RoleRow} RoleRow
 */


/**
 * @param {RoleRow} row
 * @returns {RoleDto}
 */
export function toRoleDto(row) {
  return {
    id: row.id,
    tenantId: row.tenantId,
    name: row.name,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}