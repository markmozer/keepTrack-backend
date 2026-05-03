/**
 * File: src/application/ports/users/UserRepositoryPort.js
 */

/**
 * Repo I/O
 * @typedef {import("../../../domain/users/User.js").User} User
 * @typedef {import("./user.types.js").FindUserByIdRepoInput} FindUserByIdRepoInput
 * @typedef {import("./user.types.js").FindUserByEmailRepoInput} FindUserByEmailRepoInput
 * @typedef {import("./user.types.js").FindUserByInviteTokenHashRepoInput} FindUserByInviteTokenHashRepoInput
 * @typedef {import("./user.types.js").FindUserByResetTokenHashRepoInput} FindUserByResetTokenHashRepoInput
 * 
 * 
 * @typedef {import("./user.types.js").FindUsersPageRepoInput} FindUsersPageRepoInput
 * 
 */

 /**
 * Repo Output
 * @typedef {import("./user.types.js").UserRow} UserRow
 * @typedef {import("./user.types.js").UserDetailRow} UserDetailRow
 * @typedef {import("./user.types.js").FindUsersPageRepoResult} FindUsersPageRepoResult
 */

/**
 * @typedef {Object} UserRepositoryPort
 * @property {(input: User) => Promise<User>} create
 * @property {(input: User) => Promise<User>} save
 * @property {(input: FindUserByIdRepoInput) => Promise<User | null>} findById
 * @property {(input: FindUserByEmailRepoInput) => Promise<User | null>} findByEmail
 * @property {(input: FindUserByEmailRepoInput) => Promise<User | null>} findByEmailForAuth
 * @property {(input: FindUserByInviteTokenHashRepoInput) => Promise<User | null>} findByInviteTokenHash
 * @property {(input: FindUserByResetTokenHashRepoInput) => Promise<User | null>} findByResetTokenHash
 * 
 * 
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

  if (typeof (/** @type {any} */ (repo).create) !== "function") throw new Error(errorMsg("create(...)"));
  if (typeof (/** @type {any} */ (repo).save) !== "function") throw new Error(errorMsg("save(...)"));
  if (typeof (/** @type {any} */ (repo).findById) !== "function") throw new Error(errorMsg("findById(...)"));
  if (typeof (/** @type {any} */ (repo).findByEmail) !== "function") throw new Error(errorMsg("findByEmail(...)"));
  if (typeof (/** @type {any} */ (repo).findByEmailForAuth) !== "function") throw new Error(errorMsg("findByEmailForAuth(...)"));
  if (typeof (/** @type {any} */ (repo).findByInviteTokenHash) !== "function") throw new Error(errorMsg("findByInviteTokenHash(...)"));  
  if (typeof (/** @type {any} */ (repo).findByResetTokenHash) !== "function") throw new Error(errorMsg("findByResetTokenHash(...)"));
  if (typeof (/** @type {any} */ (repo).findPage) !== "function") throw new Error(errorMsg("findPage(...)"));
  
  
}
