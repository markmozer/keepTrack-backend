/**
 * File: src/application/ports/roles/RoleRepositoryPort.js
 */

/**
 * @typedef {import("./role.types.js").RoleRow} RoleRow
 * @typedef {import("./role.types.js").CreateRoleRepoInput} CreateRoleRepoInput
 * @typedef {import("./role.types.js").FindRoleByIdRepoInput} FindRoleByIdRepoInput
 * @typedef {import("./role.types.js").FindRoleByNameRepoInput} FindRoleByNameRepoInput
 */

/**
 * @typedef {Object} RoleRepositoryPort
 * @property {(input: FindRoleByIdRepoInput) => Promise<RoleRow | null>} findById
 * @property {(input: FindRoleByNameRepoInput) => Promise<RoleRow | null>} findByName
 * @property {(input: CreateRoleRepoInput) => Promise<RoleRow>} create
 */

/**
 * @param {unknown} repo
 * @returns {asserts repo is RoleRepositoryPort}
 */
export function assertRoleRepositoryPort(repo) {
  if (
    !repo ||
    typeof repo !== "object" ||
    typeof /** @type {any} */ (repo).findById !== "function" ||
    typeof /** @type {any} */ (repo).findByName !== "function" ||
    typeof /** @type {any} */ (repo).create !== "function"
  ) {
    throw new Error(
      "RoleRepositoryPort not implemented: expected { findById(), findByName(), create() }"
    );
  }
}