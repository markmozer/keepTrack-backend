/**
 * File: src/application/ports/email/EmailServicePort.js
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
 * Runtime guard for correct dependency injection.
 *
 * @param {unknown} svc
 * @returns {asserts svc is EmailServicePort}
 */
export function assertEmailServicePort(svc) {
  const anySvc = /** @type {any} */ (svc);

  if (
    !svc ||
    typeof svc !== "object" ||
    typeof anySvc.sendInviteUserEmail !== "function"
  ) {
    throw new Error(
      "EmailServicePort not implemented: expected { sendInviteUserEmail() }",
    );
  }
}

export {};
