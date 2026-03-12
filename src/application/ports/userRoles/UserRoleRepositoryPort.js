/**
 * File: src/application/ports/userRoles/UserRoleRepositoryPort.js
 */


/**
 * @typedef {import("./userRole.types.js").UserRoleRowPublic} UserRoleRowPublic
 * @typedef {import("./userRole.types.js").AssignRoleToUserRepoInput} AssignRoleToUserRepoInput
 * @typedef {import("./userRole.types.js").FindUserRoleByUserAndRoleInput} FindUserRoleByUserAndRoleInput
 */

/**
 * @typedef {Object} UserRoleRepositoryPort
 * @property {(input: FindUserRoleByUserAndRoleInput) => Promise<UserRoleRowPublic | null>} findByUserAndRole
 * @property {(input: AssignRoleToUserRepoInput) => Promise<UserRoleRowPublic>} create
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
    typeof /** @type {any} */ (repo).create !== "function"
  ) {
    throw new Error(
      "UserRoleRepositoryPort not implemented: expected { findByUserAndRole(), create() }"
    );
  }
}