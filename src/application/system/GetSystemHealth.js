/**
 * File: keepTrack/src/application/system/GetSystemHealth.js
 */

/**
 * @typedef {Object} GetSystemHealthDeps
 * @property {import("../system/GetAppHealth.js").GetAppHealth} getAppHealth
 * @property {import("../system/GetDbHealth.js").GetDbHealth} getDbHealth
 * @property {import("../system/GetSessionHealth.js").GetSessionHealth} getSessionHealth
 */

export class GetSystemHealth {
  /**
   *
   * @param {GetSystemHealthDeps} params
   */
  constructor({
    getAppHealth,
    getDbHealth,
    getSessionHealth,
  }) {
    this.getAppHealth = getAppHealth;
    this.getDbHealth = getDbHealth;
    this.getSessionHealth = getSessionHealth;
  }
  /**
   * @returns {Promise<import("../../application/ports/system/system.types.js").SystemHealthDto>}
   */
  async execute() {
    /** @type {import("../ports/system/system.types.js").SystemHealthDto} */
    const result = {
      app: { status: "unknown" },
      db: { status: "unknown", latencyMs: 0 },
      sessions: { status: "unknown", latencyMs: 0 },
      meta: {
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
      },
    };

    // --- App health ---
    try {
      await this.getAppHealth.execute();
      result.app = { status: "up" };
    } catch {
      result.app = { status: "down" };
    }

    // --- DB health ---
    try {
      result.db = await this.getDbHealth.execute();
      // => { status: "up", latencyMs: X }
    } catch {
      result.db = { status: "down", latencyMs: 0 };
    }

    // sessions
    try {
      result.sessions = await this.getSessionHealth.execute();
    } catch {
      result.sessions = { status: "down", latencyMs: 0 };
    }

    return result;
  }
}
