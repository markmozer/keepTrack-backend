/**
 * File: src/application/ports/urls/InviteLinkBuilderPort.js
 */

/**
 * @typedef {Object} BuildInviteLinkInput
 * @property {string} slug
 * @property {string} token
 */

/**
 * @typedef {Object} InviteLinkBuilderPort
 * @property {(input: BuildInviteLinkInput) => string} buildInviteLink
 */

/**
 * @param {unknown} value
 * @returns {asserts value is InviteLinkBuilderPort}
 */
export function assertInviteLinkBuilderPort(value) {
  if (!value || typeof value !== "object") {
    throw new Error("InviteLinkBuilderPort must be an object.");
  }

  const v = /** @type {Record<string, unknown>} */ (value);

  if (typeof v.buildInviteLink !== "function") {
    throw new Error("InviteLinkBuilderPort.buildInviteLink must be a function.");
  }
}