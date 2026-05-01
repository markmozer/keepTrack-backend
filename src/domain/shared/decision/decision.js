/**
 * File: src/domain/shared/decision/decision.js
 */

/**
 * @typedef {object} DomainDecision
 * @property {boolean} allowed
 * @property {string | null} reason
 * @property {object | null} details
 */

/**
 * @returns {DomainDecision}
 */
export function allow() {
  return {
    allowed: true,
    reason: null,
    details: null,
  };
}

/**
 * @param {string} reason
 * @param {object | null} [details]
 * @returns {DomainDecision}
 */
export function deny(reason, details = null) {
  return {
    allowed: false,
    reason,
    details,
  };
}