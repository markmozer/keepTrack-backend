/**
 * File: src/infrastructure/services/security/TokenServiceCrypto.js
 */

import crypto from "crypto";

export class TokenServiceCrypto {
  /**
   * @param {{ pepper?: string }} opts
   */
  constructor({ pepper } = {}) {
    this.pepper = pepper || ""; // optioneel extra secret (server-side)
  }

  /**
   * @param {{ bytes?: number }} [opts]
   */
  generate(opts = {}) {
    const bytes = opts.bytes ?? 32; // 32 bytes => 256-bit token
    const tokenPlaintext = crypto.randomBytes(bytes).toString("base64url");
    const tokenHash = this.hash(tokenPlaintext);

    return { tokenPlaintext, tokenHash };
  }

  /**
   * Hash plaintext token (store this in DB)
   * @param {string} tokenPlaintext
   */
  hash(tokenPlaintext) {
    if (!tokenPlaintext || typeof tokenPlaintext !== "string") {
      throw new Error("TokenServiceCrypto.hash: tokenPlaintext must be a string");
    }

    // SHA-256 over token + optional pepper (server secret)
    return crypto
      .createHash("sha256")
      .update(tokenPlaintext + this.pepper, "utf8")
      .digest("hex");
  }

  /**
   * Constant-time verification
   * @param {string} tokenPlaintext
   * @param {string} tokenHash
   */
  verify(tokenPlaintext, tokenHash) {
    if (!tokenPlaintext || !tokenHash) return false;

    const computed = this.hash(tokenPlaintext);

    // timingSafeEqual vereist gelijke lengte buffers
    const a = Buffer.from(computed, "hex");
    const b = Buffer.from(tokenHash, "hex");
    if (a.length !== b.length) return false;

    return crypto.timingSafeEqual(a, b);
  }
}
