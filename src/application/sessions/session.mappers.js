/**
 * File: src/application/sessions/session.mappers.js
 */



/**
 * @param {import("../../domain/users/User.js").User} user
 * @returns {import("../ports/session/session.types.js").SessionUser}
 */
export function toSessionUserDto(user) {
  if (!user.id) {
    throw new Error("Cannot map user without id to SessionUserDto.");
  }

  return {
    id: user.id,
    email: user.email,
    status: user.status,
    displayName: "display name",
    }

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