/**
 * File: src/application/ports/roles/RoleRepositoryPort.js
 */

/**
 * Repo input
 * @typedef {import("./role.types.js").CreateRoleRepoInput} CreateRoleRepoInput
 * @typedef {import("./role.types.js").FindRoleByIdRepoInput} FindRoleByIdRepoInput
 * @typedef {import("./role.types.js").FindRoleByNameRepoInput} FindRoleByNameRepoInput
 * @typedef {import("./role.types.js").FindRolesPageRepoInput} FindRolesPageRepoInput
 */

/**
 * Repo output
 * @typedef {import("./role.types.js").RoleRow} RoleRow
 * @typedef {import("./role.types.js").RoleAdminRow} RoleAdminRow
 * @typedef {import("./role.types.js").FindRolesPageRepoResult} FindRolesPageRepoResult
 */

/**
 * @typedef {Object} RoleRepositoryPort
 * @property {(input: FindRoleByIdRepoInput) => Promise<RoleAdminRow | null>} findById
 * @property {(input: FindRoleByNameRepoInput) => Promise<RoleAdminRow | null>} findByName
 * @property {(input: CreateRoleRepoInput) => Promise<RoleAdminRow>} create
 * @property {(input: FindRolesPageRepoInput) => Promise<FindRolesPageRepoResult>} findPage
 */


/**
 * @param {string} input
 * @returns {string}
 */
function errorMsg(input) {
  return `RoleRepositoryPort not implemented: expected { ${input} }`;
}

/**
 * @param {unknown} repo
 * @returns {asserts repo is RoleRepositoryPort}
 */
export function assertRoleRepositoryPort(repo) {
  if (!repo || typeof repo !== "object")
    throw new Error("RoleRepositoryPort missing");

  if (typeof (/** @type {any} */ (repo).create) !== "function") throw new Error(errorMsg("create(...)"));
  if (typeof (/** @type {any} */ (repo).findById) !== "function") throw new Error(errorMsg("findById(...)"));
  if (typeof (/** @type {any} */ (repo).findByName) !== "function") throw new Error(errorMsg("findByName(...)"));  
  if (typeof (/** @type {any} */ (repo).findPage) !== "function") throw new Error(errorMsg("findPage(...)"));
}
