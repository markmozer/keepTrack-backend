/**
 * File: src/application/ports/users/UserRepositoryPort.js
 */


/**
 * @typedef {import("./user.types.js").UserRowPublic} UserRowPublic
 * @typedef {import("./user.types.js").CreateUserRepoInput} CreateUserRepoInput
 * @typedef {import("./user.types.js").FindUserByIdInput} FindUserByIdInput
 * @typedef {import("./user.types.js").FindUserByEmailInput} FindUserByEmailInput
 */

/**
 * @typedef {Object} UserRepositoryPort
 * @property {(input: FindUserByIdInput) => Promise<UserRowPublic | null>} findById
 * @property {(input: FindUserByEmailInput) => Promise<UserRowPublic | null>} findByEmail
 * @property {(input: CreateUserRepoInput) => Promise<UserRowPublic>} create
 */

/**
 * @param {unknown} repo
 * @returns {asserts repo is UserRepositoryPort}
 */
export function assertUserRepositoryPort(repo) {
  if (
    !repo ||
    typeof repo !== "object" ||
    typeof /** @type {any} */ (repo).findById !== "function" ||
    typeof /** @type {any} */ (repo).findByEmail !== "function" ||
    typeof /** @type {any} */ (repo).create !== "function"
  ) {
    throw new Error(
      "UserRepositoryPort not implemented: expected { findById(), findByEmail(), create() }"
    );
  }
}