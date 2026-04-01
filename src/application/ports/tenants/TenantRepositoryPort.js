/**
 * File: src/application/ports/tenants/TenantRepositoryPort.js
 */

/**
 * Repo input
 * @typedef {import("./tenant.types.js").CreateTenantRepoInput} CreateTenantRepoInput
 * @typedef {import("../../../domain/tenants/TenantType.js").TenantTypeValue} TenantType
 * @typedef {import("./tenant.types.js").FindTenantsPageRepoInput} FindTenantsPageRepoInput
 */

/**
 * Repo output
 * @typedef {import("./tenant.types.js").TenantRow} TenantRow
 * @typedef {import("./tenant.types.js").TenantAdminRow} TenantAdminRow
 * @typedef {import("./tenant.types.js").FindTenantsPageRepoResult} FindTenantsPageRepoResult
 */

/**
 * @typedef {Object} TenantRepositoryPort
 * @property {(tenantId: string) => Promise<TenantAdminRow | null>} findById
 * @property {(slug: string) => Promise<TenantAdminRow | null>} findBySlug
 * @property {(type: TenantType) => Promise<TenantAdminRow | null>} findByType
 * @property {(input: CreateTenantRepoInput) => Promise<TenantAdminRow>} create
 * @property {(input: FindTenantsPageRepoInput) => Promise<FindTenantsPageRepoResult>} findPage
 */


/**
 * @param {string} input
 * @returns {string}
 */
function errorMsg(input) {
  return `TenantRepositoryPort not implemented: expected { ${input} }`;
}

/**
 * @param {unknown} repo
 * @returns {asserts repo is TenantRepositoryPort}
 */
export function assertTenantRepositoryPort(repo) {
  if (!repo || typeof repo !== "object")
    throw new Error("TenantRepositoryPort missing");

  if (typeof (/** @type {any} */ (repo).create) !== "function") throw new Error(errorMsg("create(...)"));
  if (typeof (/** @type {any} */ (repo).findById) !== "function") throw new Error(errorMsg("findById(...)"));
  if (typeof (/** @type {any} */ (repo).findBySlug) !== "function") throw new Error(errorMsg("findBySlug(...)"));  
  if (typeof (/** @type {any} */ (repo).findByType) !== "function") throw new Error(errorMsg("findByType(...)")); 
  if (typeof (/** @type {any} */ (repo).findPage) !== "function") throw new Error(errorMsg("findPage(...)"));
}
