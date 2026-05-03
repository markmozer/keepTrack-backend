/**
 * File: keepTrack-backend/src/application/ports/auth/auth.types.js
 */
/**
 * @typedef {import("../../../domain/users/UserStatus.js").UserStatusValue} UserStatus
 */

// =====================================================
// DTOs returned by application layer.
// =====================================================


/**
 * @typedef {Object} AuthenticatedUserDto
 * @property {string} userId
 * @property {string} tenantId
 * @property {UserStatus} status
 * @property {string[]} roleNames
 */

/**
 * @typedef {Object} AuthenticationResultDto
 * @property {string} sessionId
 * @property {AuthenticatedUserDto} user
 */

// =====================================================
// Use Case related
// =====================================================

// --- AuthenticateUser ---
/**
 * UCPayload
 * @typedef {Object} AuthenticateUserUCPayload
 * @property {unknown} tenantId
 * @property {unknown} email
 * @property {unknown} passwordPlain
 */

/**
 * UCInput
 * @typedef {Object} AuthenticateUserUCInput
 * @property {null} principal
 * @property {AuthenticateUserUCPayload} payload
 */

export {};




