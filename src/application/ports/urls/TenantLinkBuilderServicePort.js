/**
 * File: src/application/ports/urls/TenantLinkBuilderServicePort.js
 */


/**
 * @typedef {Object} BuildInviteLinkInput
 * @property {string} slug
 * @property {string} token
 */

/**
 * @typedef {Object} BuildPasswordResetLinkInput
 * @property {string} slug
 * @property {string} token
 */

/**
 * @typedef {Object} TenantLinkBuilderServicePort
 * @property {(input: BuildInviteLinkInput) => string} buildInviteLink
 * @property {(input: BuildPasswordResetLinkInput) => string} buildPasswordResetLink
 */

/**
 * Runtime guard for correct dependency injection.
 *
 * @param {unknown} svc
 * @returns {asserts svc is TenantLinkBuilderServicePort}
 */
export function assertTenantLinkBuilderServicePort(svc) {
  const anySvc = /** @type {any} */ (svc);
  if (
    !svc ||
    typeof svc !== "object" ||
    typeof anySvc.buildInviteLink !== "function" ||
    typeof anySvc.buildPasswordResetLink !== "function"
  ) {
    throw new Error(
      "TenantLinkBuilderServicePort not implemented: expected { buildInviteLink(), buildPasswordResetLink() }"
    );
  }
}