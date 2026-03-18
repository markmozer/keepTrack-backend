/**
 * File: src/infrastructure/redis/RedisClient.js
 */
import Redis from "ioredis";

export class RedisClient {
  constructor({ url = process.env.REDIS_URL } = {}) {
    if (!url) throw new Error("REDIS_URL is not set");
    this.client = new Redis(url);
  }
}