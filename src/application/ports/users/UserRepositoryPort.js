/**
 * File: src/application/ports/users/UserRepositoryPort.js
 */

/**
 * Repo Input
 * @typedef {import("./user.types.js").CreateUserRepoInput} CreateUserRepoInput
 * @typedef {import("./user.types.js").FindUserByIdRepoInput} FindUserByIdRepoInput
 * @typedef {import("./user.types.js").FindUserByEmailRepoInput} FindUserByEmailRepoInput
 * @typedef {import("./user.types.js").MarkAsInvitedRepoInput} MarkAsInvitedRepoInput
 * @typedef {import("./user.types.js").ActivateFromInviteRepoInput} ActivateFromInviteRepoInput
 * @typedef {import("./user.types.js").MarkAsPwdResetRequestedRepoInput} MarkAsPwdResetRequestedRepoInput
 * @typedef {import("./user.types.js").FindUsersPageRepoInput} FindUsersPageRepoInput
 * @typedef {import("../auth/auth.types.js").FindUserByEmailForAuthRepoInput} FindUserByEmailForAuthRepoInput
 */

 /**
 * Repo Output
 * @typedef {import("./user.types.js").UserRow} UserRow
 * @typedef {import("./user.types.js").UserAdminRow} UserAdminRow
 * @typedef {import("./user.types.js").UserAuthRow} UserAuthRow
 * @typedef {import("./user.types.js").FindUsersPageRepoResult} FindUsersPageRepoResult
 */

/**
 * @typedef {Object} UserRepositoryPort
 * @property {(input: CreateUserRepoInput) => Promise<UserAdminRow>} create
 * @property {(input: FindUserByEmailRepoInput) => Promise<UserAdminRow | null>} findByEmail
 * @property {(input: FindUserByIdRepoInput) => Promise<UserAdminRow | null>} findById
 * @property {(input: MarkAsInvitedRepoInput) => Promise<UserAdminRow>} markAsInvited
 * @property {(InviteTokenHash: string) => Promise<UserAdminRow | null>} findByInviteTokenHash
 * @property {(input: ActivateFromInviteRepoInput) => Promise<UserAdminRow>} activateFromInvite
 * @property {(input: FindUserByEmailForAuthRepoInput) => Promise<UserAuthRow | null>} findByEmailForAuth
 * @property {(input: MarkAsPwdResetRequestedRepoInput) => Promise<UserAdminRow>} markAsPwdResetRequested
 * @property {(input: FindUsersPageRepoInput) => Promise<FindUsersPageRepoResult>} findPage
 */

/**
 * @param {string} input
 * @returns {string}
 */
function errorMsg(input) {
  return `UserRepositoryPort not implemented: expected { ${input} }`;
}

/**
 * @param {unknown} repo
 * @returns {asserts repo is UserRepositoryPort}
 */
export function assertUserRepositoryPort(repo) {
  if (!repo || typeof repo !== "object")
    throw new Error("UserRepositoryPort missing");

  if (typeof (/** @type {any} */ (repo).activateFromInvite) !== "function") throw new Error(errorMsg("activateFromInvite(...)"));
  if (typeof (/** @type {any} */ (repo).create) !== "function") throw new Error(errorMsg("create(...)"));
  if (typeof (/** @type {any} */ (repo).findByEmail) !== "function") throw new Error(errorMsg("findByEmail(...)"));
  if (typeof (/** @type {any} */ (repo).findByEmailForAuth) !== "function") throw new Error(errorMsg("findByEmailForAuth(...)"));
  if (typeof (/** @type {any} */ (repo).findById) !== "function") throw new Error(errorMsg("findById(...)"));
  if (typeof (/** @type {any} */ (repo).findByInviteTokenHash) !== "function") throw new Error(errorMsg("findByInviteTokenHash(...)"));  
  if (typeof (/** @type {any} */ (repo).findPage) !== "function") throw new Error(errorMsg("findPage(...)"));
  if (typeof (/** @type {any} */ (repo).markAsInvited) !== "function") throw new Error(errorMsg("markAsInvited(...)"));  
  if (typeof (/** @type {any} */ (repo).markAsPwdResetRequested) !== "function") throw new Error(errorMsg("markAsPwdResetRequested(...)"));
  
}
