/**
 * File: src/infrastructure/session/SessionStoreRedis.js
 */

/**
 * @typedef {import("../../../application/ports/session/session.types.js").SessionData} SessionData
 */


export class SessionStoreRedis {
  /**
   * @param {Object} params
   * @param {import("ioredis").Redis} params.redisClient
   * @param {import("../../../shared/config/appConfig.js").SessionConfig} params.config
   */
  constructor({ redisClient, config }) {
    this.redis = redisClient;
    this.prefix = config.keyPrefix;
  }

  /**
   *
   * @param {string} sessionId
   * @returns {string}
   */
  #key(sessionId) {
    return `${this.prefix}${sessionId}`;
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
    await this.redis.set(
      this.#key(sessionId),
      JSON.stringify(data),
      "EX",
      ttlSeconds,
    );
  }

  /**
   *
   * @param {string} sessionId
   * @returns {Promise<SessionData|null>}
   */
  async get(sessionId) {
    const value = await this.redis.get(this.#key(sessionId));
    return value ? JSON.parse(value) : null;
  }

  /**
   *
   * @param {string} sessionId
   */
  async del(sessionId) {
    await this.redis.del(this.#key(sessionId));
  }

  /** 👇 alleen voor tests / tooling */
  async deleteByPrefix() {
    const keys = await this.redis.keys(`${this.prefix}*`);
    if (keys.length > 0) {
      await this.redis.del(keys);
    }
  }
}

