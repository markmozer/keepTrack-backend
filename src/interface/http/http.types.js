/**
 * File: src/interface/http/http.types.js
 */


/**
 * @typedef {Object} RequestTenantContext
 * @property {string} id
 * @property {string} slug
 * @property {string} name
 */

/**
 * @typedef {Object} RequestContext
 * @property {RequestTenantContext} [tenant]
 */

/**
 * @typedef {import("../../domain/auth/Principal.js").Principal} Principal
 */

/**
 * @typedef {import("../../application/ports/session/session.types.js").SessionData} SessionData
 */

/**
 * @typedef {import("express").Request & {
 *   context?: RequestContext,
 *   principal?: Principal | null,
 *   session?: SessionData | null
 * }} RequestWithContext
 */

export {};