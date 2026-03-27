/**
 * File: src/application/ports/email/EmailServicePort.js
 */
/**
 * @typedef {Object} SendInviteUserEmailInput
 * @property {string} to
 * @property {string} link
 * @property {Date} expiresAt
 * @property {string} validityPeriod
 */
/**
 * @typedef {Object} SendPasswordResetEmailInput
 * @property {string} to
 * @property {string} link
 * @property {Date} expiresAt
 * @property {string} validityPeriod
 */

/**
 * @typedef {Object} EmailServicePort
 * @property {(input: SendInviteUserEmailInput) => Promise<void>} sendInviteUserEmail
 * @property {(input: SendPasswordResetEmailInput) => Promise<void>} sendPasswordResetEmail
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
    typeof anySvc.sendInviteUserEmail !== "function" ||
    typeof anySvc.sendPasswordResetEmail !== "function"
  ) {
    throw new Error(
      "EmailServicePort not implemented: expected { sendInviteUserEmail(), sendPasswordResetEmail() }",
    );
  }
}

export {};
