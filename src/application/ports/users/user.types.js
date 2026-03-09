/**
 * File: keepTrack-backend/src/application/ports/users/user.types.js
 */

/**
 * @typedef {import("../../../domain/users/UserStatus.js")} UserStatus
 */

/**
 * @typedef {Object} UserDto
 * @property {string} id
 * @property {string} tenantId
 * @property {string} email
 * @property {string | null} passwordHash
 * @property {UserStatus} status
 * @property {string | null} personBusinessPartnerId
 * @property {string | null} inviteToken
 * @property {string | null} inviteTokenExpiresAt
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} CreateUserRepoInput
 * @property {string} id
 * @property {string} tenantId
 * @property {string} email
 * @property {string | null} passwordHash
 * @property {UserStatus} status
 * @property {string | null} personBusinessPartnerId
 * @property {string | null} inviteToken
 * @property {Date | null} inviteTokenExpiresAt
 * @property {Date} [createdAt]
 * @property {Date} [updatedAt]
 */

/**
 * @typedef {Object} UpdateUserInviteRepoInput
 * @property {string} userId
 * @property {string} inviteToken
 * @property {Date} inviteTokenExpiresAt
 * @property {Date} [updatedAt]
 */

export {};
