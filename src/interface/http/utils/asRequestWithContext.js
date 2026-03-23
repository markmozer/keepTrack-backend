/**
 * File: src/interface/http/utils/asRequestWithContext.js
 */

/**
 * @typedef {import("../http.types.js").RequestWithContext} RequestWithContext
 */

/**
 * Cast Express request to RequestWithContext
 *
 * @param {import("http").IncomingMessage} req
 * @returns {RequestWithContext}
 */
export function asRequestWithContext(req) {
  return /** @type {RequestWithContext} */ (req);
}