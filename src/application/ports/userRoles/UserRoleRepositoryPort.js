/**
 * File: src/application/ports/userRoles/UserRoleRepositoryPort.js
 */


/**
 * @typedef {import("../../../domain/users/UserRole.js").UserRole} UserRole
 */

/**
 * @typedef {Object} UserRoleRepositoryPort
 * @property {(input: UserRole) => Promise<UserRole>} create
 */

/**
 * @param {unknown} repo
 * @returns {asserts repo is UserRoleRepositoryPort}
 */
export function assertUserRoleRepositoryPort(repo) {
  if (
    !repo ||
    typeof repo !== "object" ||
    typeof /** @type {any} */ (repo).create !== "function"
  ) {
    throw new Error(
      "UserRoleRepositoryPort not implemented: expected { create() }"
    );
  }
}