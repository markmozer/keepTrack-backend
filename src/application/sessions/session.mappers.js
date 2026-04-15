/**
 * File: src/application/sessions/session.mappers.js
 */

/**
 * @param {import("../ports/users/user.types.js").UserRow} row
 * @returns {import("../ports/session/session.types.js").SessionUser}
 */
export function toSessionUserDto(row) {
  return {
    id: row.id,
    email: row.email,
    status: row.status,
    displayName: "display name",
  };
}

/**
 * @param {import("../ports/tenants/tenant.types.js").TenantRow} row
 * @returns {import("../ports/session/session.types.js").SessionTenant}
 */
export function toSessionTenantDto(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    type: row.type,
  };
}