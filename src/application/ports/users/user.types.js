/**
 * File: keepTrack-backend/src/application/ports/users/user.types.js
 */

/**
 * @typedef {import("../../../domain/users/UserStatus.js").UserStatusValue} UserStatus
 */

/**
 * Repository model returned by persistence layer.
 * matches userRowPublicSelect
 *
 * @typedef {Object} UserRowPublic
 * @property {string} id
 * @property {string} tenantId
 * @property {string} email
 * @property {UserStatus} status
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * DTO returned by application layer.
 * mapped from UserRowPublic
 *
 * @typedef {Object} UserDtoPublic
 * @property {string} id
 * @property {string} tenantId
 * @property {string} email
 * @property {UserStatus} status
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * Input used for CreateUser.
 * 
 * UseCaseInput
 * @typedef {Object} CreateUserUseCaseInput
 * @property {string} tenantId
 * @property {string} email
 * 
 * RepoInput
 * @typedef {Object} CreateUserRepoInput
 * @property {string} id
 * @property {string} tenantId
 * @property {string} email
 * @property {UserStatus} [status]  // Defaults to NEW if omitted
 * @property {Date} [createdAt]
 * @property {Date} [updatedAt]
 */

/**
 * Input used for findById
 * 
 * UseCaseInput === RepoInput 
 * @typedef {Object} FindUserByIdInput
 * @property {string} tenantId
 * @property {string} userId
 */

/**
 * Input used for findByEmail
 * 
 * UseCaseInput === RepoInput
 * @typedef {Object} FindUserByEmailInput
 * @property {string} tenantId
 * @property {string} email
 */

export {};
