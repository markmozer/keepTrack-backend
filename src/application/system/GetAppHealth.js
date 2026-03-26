/**
 * File: keepTrack/src/application/system/GetAppHealth.js
 */

export class GetAppHealth {
  /**
   * @returns {Promise<import("../ports/system/system.types").HealthDto>}
   */
  async execute() {
    return {
      status: "up",
    };
  }
}
