/**
 * File: src/application/security/PasswordHasherPort.js
 */


/**
 * @typedef {Object} PasswordServicePort
 * @property {(passwordPlaintext: string) => Promise<string>} hash
 * @property {(passwordPlaintext: string, passwordHash: string) => Promise<boolean>} verify
 */

/**
 * Runtime guard for correct dependency injection.
 *
 * @param {unknown} svc
 * @returns {asserts svc is PasswordServicePort}
 */
export function assertPasswordServicePort(svc) {
  const anySvc = /** @type {any} */ (svc);

  if (
    !svc ||
    typeof svc !== "object" ||
    typeof anySvc.hash !== "function" ||
    typeof anySvc.verify !== "function"
  ) {
    throw new Error(
      "PasswordServicePort not implemented: expected { hash(), verify() }"
    );
  }
}

export {};
