/**
 * File: src/application/users/user.mappers.js
 */

/**
 * @typedef {import("../ports/users/user.types.js").UserDtoPublic} UserDtoPublic
 * @typedef {import("../ports/users/user.types.js").UserRowPublic} UserRowPublic
 */


/**
 * @param {UserRowPublic} row
 * @returns {UserDtoPublic}
 */
export function toUserDtoPublic(row) {
  return {
    id: row.id,
    tenantId: row.tenantId,
    email: row.email,
    inviteTokenExpiresAt: row.inviteTokenExpiresAt ? row.inviteTokenExpiresAt.toISOString() : null,
    status: row.status,
  };
}