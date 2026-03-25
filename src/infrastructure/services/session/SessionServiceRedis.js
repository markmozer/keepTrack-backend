/**
 * File: src/infrastructure/session/SessionServiceRedis.js
 */
import crypto from "crypto";

/**
 * @typedef {import("../../../application/ports/session/SessionServicePort.js").SessionServicePort} SessionServicePort
 */

/**
 * @typedef {import("../../../application/ports/session/session.types.js").SessionData} SessionData
 * @typedef {import("../../../application/ports/session/session.types.js").SessionId} SessionId
 * @typedef {import("../../../application/ports/session/session.types.js").CreatedSession} CreatedSession
 * @typedef {import("../session/SessionStoreRedis.js").SessionStoreRedis} SessionStoreRedis
 */

/**
 * @implements {SessionServicePort}
 */
export class SessionServiceRedis {
  /**
   * @param {Object} params
   * @param {SessionStoreRedis} params.sessionStore
   * @param {import("../../../shared/config/appConfig.js").SessionConfig} params.config
   */
  constructor({ sessionStore, config }) {
    this.sessionStore = sessionStore;
    this.ttlSeconds = config.ttlSeconds;
  }

  /**
   *
   * @param {SessionData} params
   * @returns {Promise<CreatedSession>}
   */
  async createSession({ userId, tenantId, roleNames }) {
    const sessionId = crypto.randomUUID();

    await this.sessionStore.set(
      sessionId,
      {
        userId,
        tenantId,
        roleNames: Array.isArray(roleNames) ? roleNames : [], // ✅ altijd array
        createdAt: new Date().toISOString(),
      },
      this.ttlSeconds,
    );


    return {sessionId};
  }

  /**
   * @param {SessionId} sessionId
   * @returns {Promise<SessionData|null>}
   */
  async getSession({sessionId}) {
    if (!sessionId) return null;
    return this.sessionStore.get(sessionId);
  }

  /**
   *
   * @param {SessionId} sessionId
   * @returns {Promise<void>}
   */
  async destroySession({sessionId}) {
    if (!sessionId) return;
    await this.sessionStore.del(sessionId);
  }
}
