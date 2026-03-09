/**
 * File: keepTrack-backend/src/application/ports/users/UserRepositoryPort.js
 */

/**
 * @typedef {import("./user.types.js").UserDto} UserDto
 * @typedef {import("./user.types.js").CreateUserRepoInput} CreateUserRepoInput
 * @typedef {import("./user.types.js").UpdateUserInviteRepoInput} UpdateUserInviteRepoInput
 */

/**
 * @typedef {Object} UserRepositoryPort
 * @property {(id: string) => Promise<UserDto | null>} findById
 * @property {(tenantId: string, email: string) => Promise<UserDto | null>} findByEmailInTenant
 * @property {(inviteToken: string) => Promise<UserDto | null>} findByInviteToken
 * @property {(input: CreateUserRepoInput) => Promise<UserDto>} create
 * @property {(input: UpdateUserInviteRepoInput) => Promise<UserDto>} updateInvite
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
    typeof /** @type {any} */ (repo).findByEmailInTenant !== "function" ||
    typeof /** @type {any} */ (repo).findByInviteToken !== "function" ||
    typeof /** @type {any} */ (repo).create !== "function" ||
    typeof /** @type {any} */ (repo).updateInvite !== "function"
  ) {
    throw new Error(
      "UserRepositoryPort not implemented: expected { findById(), findByEmailInTenant(), findByInviteToken(), create(), updateInvite() }"
    );
  }
}
