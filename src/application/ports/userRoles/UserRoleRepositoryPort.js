/**
 * File: src/application/ports/userRoles/UserRoleRepositoryPort.js
 */


/**
 * @typedef {import("./userRole.types.js").UserRoleRow} UserRoleRow
 * @typedef {import("./userRole.types.js").AssignRoleToUserRepoInput} AssignRoleToUserRepoInput
 * @typedef {import("./userRole.types.js").FindUserRoleByUserAndRoleRepoInput} FindUserRoleByUserAndRoleRepoInput
 * @typedef {import("./userRole.types.js").FindUserRolesByUserRepoInput} FindUserRolesByUserRepoInput
 * @typedef {import("./userRole.types.js").FindValidUserRolesByUserRepoInput} FindValidUserRolesByUserRepoInput
 */

/**
 * @typedef {Object} UserRoleRepositoryPort
 * @property {(input: FindUserRoleByUserAndRoleRepoInput) => Promise<UserRoleRow | null>} findByUserAndRole
 * @property {(input: AssignRoleToUserRepoInput) => Promise<UserRoleRow>} create
 * @property {(input: FindUserRolesByUserRepoInput) => Promise<UserRoleRow[] | null>} findByUser
 * @property {(input: FindValidUserRolesByUserRepoInput) => Promise<UserRoleRow[] | null>} findValidByUser
 */

/**
 * @param {unknown} repo
 * @returns {asserts repo is UserRoleRepositoryPort}
 */
export function assertUserRoleRepositoryPort(repo) {
  if (
    !repo ||
    typeof repo !== "object" ||
    typeof /** @type {any} */ (repo).findByUserAndRole !== "function" ||
    typeof /** @type {any} */ (repo).create !== "function" ||
    typeof /** @type {any} */ (repo).findByUser !== "function" ||
    typeof /** @type {any} */ (repo).findValidByUser !== "function"
  ) {
    throw new Error(
      "UserRoleRepositoryPort not implemented: expected { findByUserAndRole(), create(), findByUser(), findValidByUser() }"
    );
  }
}