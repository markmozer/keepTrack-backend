/**
 * File: keepTrack-backend/src/application/ports/roles/role.types.js
 */


/**
 * Repository model returned by persistence layer.
 * matches roleSelect
 *
 * @typedef {Object} RoleRow
 * @property {string} id
 * @property {string} tenantId
 * @property {string} name
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * DTO returned by application layer.
 * mapped from RoleRow
 *
 * @typedef {Object} RoleDto
 * @property {string} id
 * @property {string} tenantId
 * @property {string} name
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * Input for CreateRole.
 *
 * UseCaseInput
 * @typedef {Object} CreateRoleUseCaseInput
 * @property {string} tenantId
 * @property {string} name
 * 
 * RepoInput
 * @typedef {Object} CreateRoleRepoInput
 * @property {string} id
 * @property {string} tenantId
 * @property {string} name
 * @property {Date} [createdAt]
 * @property {Date} [updatedAt]
 */

/**
 * Input for findById
 * 
 * UseCaseInput = RepoInput
 * @typedef {Object} FindRoleByIdInput
 * @property {string} tenantId
 * @property {string} roleId
 */

/**
 * Input for findByName
 * 
 * UseCaseInput = RepoInput
 * @typedef {Object} FindRoleByNameInput
 * @property {string} tenantId
 * @property {string} name
 */

export {};
