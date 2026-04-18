/**
 * File: src/application/ports/session/session.types.js
 */

/**
 * @typedef {Object} SessionData
 * @property {string} userId
 * @property {string} tenantId
 * @property {string[]} roleNames
 */

/**
 * @typedef {Object} SessionId
 * @property {string} sessionId
 */

/**
 * @typedef {Object} CreatedSession
 * @property {string} sessionId
 */

/**
 * @typedef {Object} SessionUser
 * @property {string} id
 * @property {string} email
 * @property {import("../../../domain/users/UserStatus.js").UserStatusValue} status
 * @property {string} displayName
 */

/**
 * @typedef {Object} SessionTenant
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {import("../../../domain/tenants/TenantType.js").TenantTypeValue} type
 */


/**
 * @typedef {Object} CurrentSessionDto
 * @property {SessionData} principal
 * @property {SessionUser} user
 * @property {SessionTenant} tenant
 * @property {string[]} abilities
 */


// =====================================================
// Use Case related
// =====================================================

// --- GetCurrentSession ---
/**
 * UCPayload
 * @typedef {Object} GetCurrentSessionUCPayload
 * @property {unknown} userId
 * @property {unknown} tenantId
 */

/**
 * UCInput
 * @typedef {Object} GetCurrentSessionUCInput
 * @property {unknown} principal
 * @property {GetCurrentSessionUCPayload} payload
 */

export {};