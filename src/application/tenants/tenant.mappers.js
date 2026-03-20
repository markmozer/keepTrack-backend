/**
 * File: src/application/tenants/tenant.mappers.js
 */

/**
 * @typedef {import("../ports/tenants/tenant.types.js").TenantDto} TenantDto
 * @typedef {import("../ports/tenants/tenant.types.js").TenantRow} TenantRow
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