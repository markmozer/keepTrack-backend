/**
 * File: src/application/ports/userRoles/UserRoleRepositoryPort.js
 */


/**
 * @typedef {import("./userRole.types.js").UserRoleRow} UserRoleRow
 * @typedef {import("./userRole.types.js").AssignRoleToUserRepoInput} AssignRoleToUserRepoInput
 * @typedef {import("./userRole.types.js").FindUserRoleByUserAndRoleInput} FindUserRoleByUserAndRoleInput
 * @typedef {import("./userRole.types.js").FindUserRolesByUserInput} FindUserRolesByUserInput
 * @typedef {import("./userRole.types.js").FindValidUserRolesByUserInput} FindValidUserRolesByUserInput
 */

/**
 * @typedef {Object} UserRoleRepositoryPort
 * @property {(input: FindUserRoleByUserAndRoleInput) => Promise<UserRoleRow | null>} findByUserAndRole
 * @property {(input: AssignRoleToUserRepoInput) => Promise<UserRoleRow>} create
 * @property {(input: FindUserRolesByUserInput) => Promise<UserRoleRow[] | null>} findByUser
 * @property {(input: FindValidUserRolesByUserInput) => Promise<UserRoleRow[] | null>} findValidByUser
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