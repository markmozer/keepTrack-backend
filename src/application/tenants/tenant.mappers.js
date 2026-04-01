/**
 * File: src/application/tenants/tenant.mappers.js
 */

/**
 * @typedef {import("../ports/tenants/tenant.types.js").TenantDto} TenantDto
 * @typedef {import("../ports/tenants/tenant.types.js").TenantRow} TenantRow
 * @typedef {import("../ports/tenants/tenant.types.js").TenantAdminDto} TenantAdminDto
 * @typedef {import("../ports/tenants/tenant.types.js").TenantAdminRow} TenantAdminRow
 */


/**
 * @param {TenantRow} row
 * @returns {TenantDto}
 */
export function toTenantDto(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    type: row.type,
    status: row.status,
  };
}

/**
 * @param {TenantAdminRow} row
 * @returns {TenantAdminDto}
 */
export function toTenantAdminDto(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    type: row.type,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}