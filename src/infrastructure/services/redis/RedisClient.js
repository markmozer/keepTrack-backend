/**
 * File: src/infrastructure/redis/RedisClient.js
 */
import Redis from "ioredis";

/**
 * @typedef {import("../../../app/config/appConfig.js").SessionConfig} SessionConfig
 */

export class RedisClient {
  /**
   * @param {Object} params
   * @param {SessionConfig} params.config
   */
  constructor({ config }) {
    if (!config?.redisUrl) {
      throw new Error("RedisClient requires redisUrl");
    }

    this.client = new Redis(config.redisUrl);
  }
}