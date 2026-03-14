/**
 * File: src/application/ports/userRoles/userRole.types.js
 */

/**
 * Repository model returned by persistence layer.
 * matches userRoleRowPublicSelect
 *
 * @typedef {Object} UserRoleRowPublic
 * @property {string} id
 * @property {string} tenantId
 * @property {string} userId
 * @property {string} roleId
 * @property {Date} validFrom
 * @property {Date | null} validTo
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @property {string} roleName
 */

/**
 * DTO returned by application layer.
 * mapped from UserRoleRowPublic
 *
 * @typedef {Object} UserRoleDtoPublic
 * @property {string} id
 * @property {string} tenantId
 * @property {string} userId
 * @property {string} roleId
 * @property {string} validFrom
 * @property {string | null} validTo
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string} roleName
 */

/**
 * DTO returned by application layer.
 * Specific for AssignRoleToUser
 *
 * @typedef {Object} AssignRoleToUserDto
 * @property {boolean} created
 * @property {UserRoleDtoPublic} payload
 */

/**
 * Input used for AssignRoleToUser.
 * 
 * UseCaseInput
 * @typedef {Object} AssignRoleToUserUseCaseInput
 * @property {string} tenantId
 * @property {string} userId
 * @property {string} roleId
 * @property {string} validFrom
 * @property {string} validTo
 * 
 * 
 * RepoInput
 * @typedef {Object} AssignRoleToUserRepoInput
 * @property {string} id
 * @property {string} tenantId
 * @property {string} userId
 * @property {string} roleId
 * @property {Date} validFrom
 * @property {Date | null} validTo
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * Input used for findUserRoleByUserAndRole
 * 
 * UseCaseInput === RepoInput 
 * @typedef {Object}  FindUserRoleByUserAndRoleInput
 * @property {string} tenantId
 * @property {string} userId
 * @property {string} roleId
 */


/**
 * Input used for findUserRolesByUser
 * 
 * UseCaseInput === RepoInput 
 * @typedef {Object}  FindUserRolesByUserInput
 * @property {string} tenantId
 * @property {string} userId
 */


/**
 * Input used for findValidUserRolesByUser
 * 
 * UseCaseInput === RepoInput 
 * @typedef {Object}  FindValidUserRolesByUserInput
 * @property {string} tenantId
 * @property {string} userId
 * @property {Date} atDate
 */


export {};
