/**
 * File: src/application/system/GetSessionHealth.js
 */

/**
 * @typedef {Object} Deps
 * @property {import("../ports/system/SessionHealthServicePort").SessionHealthServicePort} sessionHealthService
 */

export class GetSessionHealth {
  /**
   * 
   * @param {Deps} param
   */
  constructor({ sessionHealthService }) {
    this.sessionHealthService = sessionHealthService;
  }

  /**
 * @returns {Promise<import("../ports/system/system.types").HealthWithLatencyDto>}
 */
  async execute() {
    const result = await this.sessionHealthService.getHealth();
    return result;
  }
}
