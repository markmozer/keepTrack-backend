/**
 * File: src/application/ports/users/UserRepositoryPort.js
 */


/**
 * @typedef {import("./user.types.js").UserRowPublic} UserRowPublic
 * @typedef {import("./user.types.js").UserRowPublicWithRoles} UserRowPublicWithRoles
 * @typedef {import("./user.types.js").CreateUserRepoInput} CreateUserRepoInput
 * @typedef {import("./user.types.js").FindUserByIdRepoInput} FindUserByIdRepoInput
 * @typedef {import("./user.types.js").FindUserByEmailRepoInput} FindUserByEmailRepoInput
 * @typedef {import("./user.types.js").MarkAsInvitedRepoInput} MarkAsInvitedRepoInput
 * @typedef {import("./user.types.js").ActivateFromInviteRepoInput} ActivateFromInviteRepoInput
 * @typedef {import("./user.types.js").FindUsersByRoleIdRepoInput} FindUserByRoleIdRepoInput
 * 
 * @typedef {import("../auth/auth.types.js").UserRowForAuth} UserRowForAuth
 * @typedef {import("../auth/auth.types.js").FindUserByEmailForAuthRepoInput} FindUserByEmailForAuthRepoInput
 */

/**
 * @typedef {Object} UserRepositoryPort
 * @property {(input: FindUserByIdRepoInput) => Promise<UserRowPublic | null>} findById
 * @property {(input: FindUserByEmailRepoInput) => Promise<UserRowPublic | null>} findByEmail
 * @property {(input: CreateUserRepoInput) => Promise<UserRowPublic>} create
 * @property {(input: MarkAsInvitedRepoInput) => Promise<UserRowPublic>} markAsInvited
 * @property {(InviteTokenHash: string) => Promise<UserRowPublic | null>} findByInviteTokenHash
 * @property {(input: ActivateFromInviteRepoInput) => Promise<UserRowPublic>} activateFromInvite
 * @property {(input: FindUserByRoleIdRepoInput ) => Promise<UserRowPublicWithRoles[]>} findByRoleId
 * 
 * @property {(input: FindUserByEmailForAuthRepoInput) => Promise<UserRowForAuth | null>} findByEmailForAuth

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
    typeof /** @type {any} */ (repo).create !== "function" ||
    typeof /** @type {any} */ (repo).markAsInvited !== "function" ||
    typeof /** @type {any} */ (repo).findByInviteTokenHash !== "function" ||
    typeof /** @type {any} */ (repo).activateFromInvite !== "function" ||
    typeof /** @type {any} */ (repo).findByEmailForAuth !== "function" ||
    typeof /** @type {any} */ (repo).findByRoleId !== "function"
  ) {
    
    throw new Error(
      "UserRepositoryPort not implemented: expected { findById(), findByEmail(), create(), markAsInvited(), findByInviteTokenHash(), activateFromInvite(), findByEmailForAuth() }"
    );
  }
}