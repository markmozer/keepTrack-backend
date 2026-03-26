/**
 * File: keepTrack-backend/src/application/system/GetDbHealth.js
 */

/**
 * @typedef {Object} Deps
 * @property {import("../ports/system/DbHealthServicePort").DbHealthServicePort} dbHealthService
 */

export class GetDbHealth {
  /**
   * 
   * @param {Deps} param
   */
  constructor({ dbHealthService }) {
    this.dbHealthService = dbHealthService;
  }
  /**
   *
   * @returns {Promise<import("../ports/system/system.types").HealthWithLatencyDto>}
   */
  async execute() {

    const result = await this.dbHealthService.getHealth();
    return result;
  }
}
