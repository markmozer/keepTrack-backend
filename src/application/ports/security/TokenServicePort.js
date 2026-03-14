/**
 * File: src/application/ports/security/TokenServicePort.js
 */

/**
 * @typedef {Object} TokenPair
 * @property {string} tokenPlaintext  // alleen voor email-link / response
 * @property {string} tokenHash       // opslaan in DB
 */

/**
 * @typedef {Object} TokenServicePort
 * @property {(opts?: { bytes?: number }) => TokenPair} generate
 * @property {(tokenPlaintext: string) => string} hash
 * @property {(tokenPlaintext: string, tokenHash: string) => boolean} verify
 */

/**
 * Runtime guard for correct dependency injection.
 *
 * @param {unknown} svc
 * @returns {asserts svc is TokenServicePort}
 */
export function assertTokenServicePort(svc) {
  const anySvc = /** @type {any} */ (svc);

  if (
    !svc ||
    typeof svc !== "object" ||
    typeof anySvc.generate !== "function" ||
    typeof anySvc.hash !== "function" ||
    typeof anySvc.verify !== "function"
  ) {
    throw new Error(
      "TokenServicePort not implemented: expected { generate(), hash(), verify() }"
    );
  }
}

export {};
