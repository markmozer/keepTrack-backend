/**
 * File: src/infrastructure/session/SessionStoreRedis.js
 */

/**
 * @typedef {Object} SessionStoreRedisDeps
 * @property {import("ioredis").Redis} redisClient
 */

export class SessionStoreRedis {
  #client;
  #prefix;
  /**
   * @param {SessionStoreRedisDeps} deps
   * @param {{ prefix?: string }} [options]
   */
  constructor({ redisClient }, { prefix = "sess:" } = {}) {
    this.#client = redisClient;
    this.#prefix = prefix;
  }

  /**
   *
   * @param {string} sessionId
   * @returns {string}
   */
  #key(sessionId) {
    return `${this.#prefix}${sessionId}`;
  }

  /**
   *
   * @param {string} sessionId
   * @param {Record<string, any>} data
   * @param {number} ttlSeconds
   * @returns {Promise<void>}
   */
  async set(sessionId, data, ttlSeconds) {
    if (!Number.isInteger(ttlSeconds) || ttlSeconds <= 0) {
      throw new Error("ttlSeconds must be a positive integer");
    }
    await this.#client.set(
      this.#key(sessionId),
      JSON.stringify(data),
      "EX",
      ttlSeconds,
    );
  }

  /**
   *
   * @param {string} sessionId
   * @returns {Promise<Record<string, any>|null>}
   */
  async get(sessionId) {
    const value = await this.#client.get(this.#key(sessionId));
    return value ? JSON.parse(value) : null;
  }

  /**
   *
   * @param {string} sessionId
   */
  async del(sessionId) {
    await this.#client.del(this.#key(sessionId));
  }

  /** 👇 alleen voor tests / tooling */
  async deleteByPrefix() {
    const keys = await this.#client.keys(`${this.#prefix}*`);
    if (keys.length > 0) {
      await this.#client.del(keys);
    }
  }
}
0;
