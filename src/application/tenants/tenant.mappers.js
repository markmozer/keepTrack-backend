/**
 * File: keepTrack-backend/src/application/tenants/tenant.mappers.js
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
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}