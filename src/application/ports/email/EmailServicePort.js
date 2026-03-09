/**
 * File: keepTrack-backend/src/application/ports/email/EmailServicePort.js
 */
/**
 * @typedef {Object} SendInviteUserEmailInput
 * @property {string} to
 * @property {string} link
 * @property {Date} expiresAt
 */

/**
 * @typedef {Object} EmailServicePort
 * @property {(input: SendInviteUserEmailInput) => Promise<void>} sendInviteUserEmail
 */

/**
 * @param {unknown} svc
 * @returns {asserts svc is EmailServicePort}
 */
export function assertEmailServicePort(svc) {
  if (
    !svc ||
    typeof svc !== "object" ||
    typeof /** @type {any} */ (svc).sendInviteUserEmail !== "function"
  ) {
    throw new Error(
      "EmailServicePort not implemented: expected { sendInviteUserEmail() }"
    );
  }
}

export {};
