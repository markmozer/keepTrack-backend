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
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}