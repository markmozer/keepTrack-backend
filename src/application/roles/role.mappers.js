/**
 * File: src/application/roles/role.mappers.js
 */

/**
 * @param {import("../ports/roles/role.types.js").RoleRow} row
 * @returns {import("../ports/roles/role.types.js").RoleDto}
 */
export function toRoleDto(row) {
  return {
    id: row.id,
    tenantId: row.tenantId,
    name: row.name,
  };
}

/**
 * @param {import("../ports/roles/role.types.js").RoleAdminRow} row
 * @returns {import("../ports/roles/role.types.js").RoleAdminDto}
 */
export function toRoleAdminDto(row) {
  return {
    id: row.id,
    tenantId: row.tenantId,
    name: row.name,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}