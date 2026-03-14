/**
 * File: src/infrastructure/services/security/PasswordHasherBcrypt.js
 */


import bcrypt from "bcrypt";

/**
 * @typedef {Object} PasswordHasherBcryptConfig
 * @property {number=} cost  // bcrypt cost factor (default 12)
 */

export class PasswordHasherBcrypt {

  /**
   * @param {PasswordHasherBcryptConfig} [config]
   */
  constructor({ cost = 12 } = {}) {
    this.cost = cost;
  }

  /**
   * Hash a plain password.
   *
   * @param {string} passwordPlain
   * @returns {Promise<string>}
   */
  async hash(passwordPlain) {
    return bcrypt.hash(passwordPlain, this.cost);
  }

  /**
   * Verify a plain password against a hash.
   *
   * @param {string} passwordPlain
   * @param {string} passwordHash
   * @returns {Promise<boolean>}
   */
  async verify(passwordPlain, passwordHash) {
    return bcrypt.compare(passwordPlain, passwordHash);
  }
}
