/**
 * File: keepTrack-backend/src/application/ports/roles/role.types.js
 */


/**
 * Repository model returned by persistence layer.
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
 *
 * @typedef {Object} RoleDto
 * @property {string} id
 * @property {string} tenantId
 * @property {string} name
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * Input used by repository when creating a role.
 *
 * @typedef {Object} CreateRoleRepoInput
 * @property {string} id
 * @property {string} tenantId
 * @property {string} name
 * @property {Date} [createdAt]
 * @property {Date} [updatedAt]
 */

/**
 * Input used by repository when finding a role by id
 * 
 * @typedef {Object} FindRoleByIdRepoInput
 * @property {string} tenantId
 * @property {string} roleId
 */

/**
 * Input used by repository when finding a role by name
 * 
 * @typedef {Object} FindRoleByNameRepoInput
 * @property {string} tenantId
 * @property {string} name
 */

export {};
