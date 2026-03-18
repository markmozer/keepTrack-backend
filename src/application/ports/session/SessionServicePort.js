/**
 * File: src/application/ports/session/SessionServicePort.js
 */

/**
 * @typedef {import("./session.types.js").SessionData} SessionData
 * @typedef {import("./session.types.js").SessionId} SessionId
 * @typedef {import("./session.types.js").CreatedSession} CreatedSession
 */

/**
 * @typedef {Object} SessionServicePort
 * @property {(input: SessionData) => Promise<CreatedSession>} createSession
 * @property {(input: SessionId) => Promise<SessionData | null>} getSession
 * @property {(input: SessionId) => Promise<void>} destroySession
 */

/**
 * Runtime guard for correct dependency injection.
 *
 * @param {unknown} svc
 * @returns {asserts svc is SessionServicePort}
 */
export function assertSessionServicePort(svc) {
  const anySvc = /** @type {any} */ (svc);

  if (
    !svc ||
    typeof svc !== "object" ||
    typeof anySvc.createSession !== "function" ||
    typeof anySvc.getSession !== "function" ||
    typeof anySvc.destroySession !== "function"
  ) {
    throw new Error(
      "SessionServicePort not implemented: expected { createSession(), getSession(), destroySession() }"
    );
  }
}
