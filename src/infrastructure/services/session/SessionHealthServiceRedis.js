/**
 * File: keepTrack-backend/src/infrastructure/services/session/SessionHealthServiceRedis.js
 */

/**
 * @typedef {import("../../../application/ports/system/SessionHealthServicePort.js").SessionHealthServicePort} SessionHealthServicePort
 * @typedef {import("../../../application/ports/system/system.types.js").HealthWithLatencyDto} HealthWithLatencyDto
 * @typedef {import("ioredis").Redis} Redis
 */

/**
 * @implements {SessionHealthServicePort}
 */
export class SessionHealthServiceRedis {
  /**
   * @param {Object} params
   * @param {Redis} params.redisClient
   */
  constructor({ redisClient }) {
    this.redis = redisClient;
  }
/**
 * @returns {Promise<HealthWithLatencyDto>}
 */
  async getHealth() {
    // ioredis supports ping()
    const start = Date.now();
    await this.redis.ping();
    return {status: "up", latencyMs: Date.now() - start}
  }
}
