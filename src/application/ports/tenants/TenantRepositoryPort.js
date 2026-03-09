/**
 * File: keepTrack-backend/src/application/ports/tenants/TenantRepositoryPort.js
 */

/**
 * @typedef {import("./tenant.types.js").TenantRow} TenantRow
 * @typedef {import("./tenant.types.js").CreateTenantRepoInput} CreateTenantRepoInput
 */

/**
 * @typedef {Object} TenantRepositoryPort
 * @property {(id: string) => Promise<TenantRow | null>} findById
 * @property {(slug: string) => Promise<TenantRow | null>} findBySlug
 * @property {(input: CreateTenantRepoInput) => Promise<TenantRow>} create
 */

/**
 * @param {unknown} repo
 * @returns {asserts repo is TenantRepositoryPort}
 */
export function assertTenantRepositoryPort(repo) {
  if (
    !repo ||
    typeof repo !== "object" ||
    typeof /** @type {any} */ (repo).findById !== "function" ||
    typeof /** @type {any} */ (repo).findBySlug !== "function" ||
    typeof /** @type {any} */ (repo).create !== "function"
  ) {
    throw new Error(
      "TenantRepositoryPort not implemented: expected { findById(), findBySlug(), create() }"
    );
  }
}