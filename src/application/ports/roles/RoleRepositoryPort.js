/**
 * File: keepTrack-backend/src/application/ports/roles/RoleRepositoryPort.js
 */

/**
 * @typedef {import("./role.types.js").RoleDto} RoleDto
 * @typedef {import("./role.types.js").CreateRoleRepoInput} CreateRoleRepoInput
 * @typedef {import("./role.types.js").AssignRoleToUserRepoInput} AssignRoleToUserRepoInput
 */

/**
 * @typedef {Object} RoleRepositoryPort
 * @property {(tenantId: string, name: string) => Promise<RoleDto | null>} findByNameInTenant
 * @property {(input: CreateRoleRepoInput) => Promise<RoleDto>} create
 * @property {(input: AssignRoleToUserRepoInput) => Promise<void>} assignToUser
 * @property {(input: { tenantId: string, userId: string, roleName: string }) => Promise<boolean>} userHasRole
 * @property {(userId: string) => Promise<Array<{ roleId: string, roleName: string, tenantId: string, validFrom: string, validTo: string | null }>>} listRolesForUser
 */

/**
 * @param {unknown} repo
 * @returns {asserts repo is RoleRepositoryPort}
 */
export function assertRoleRepositoryPort(repo) {
  if (
    !repo ||
    typeof repo !== "object" ||
    typeof /** @type {any} */ (repo).findByNameInTenant !== "function" ||
    typeof /** @type {any} */ (repo).create !== "function" ||
    typeof /** @type {any} */ (repo).assignToUser !== "function" ||
    typeof /** @type {any} */ (repo).userHasRole !== "function" ||
    typeof /** @type {any} */ (repo).listRolesForUser !== "function"
  ) {
    throw new Error(
      "RoleRepositoryPort not implemented: expected { findByNameInTenant(), create(), assignToUser(), userHasRole(), listRolesForUser() }"
    );
  }
}
