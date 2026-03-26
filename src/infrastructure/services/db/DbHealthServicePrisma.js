/**
 * File: keepTrack-backend/src/infrastructure/services/db/DbHealthServicePrisma.js
 */

/**
 * @typedef {import("../../../application/ports/system/DbHealthServicePort.js").DbHealthServicePort} DbHealthServicePort
 * @typedef {import("../../../application/ports/system/system.types.js").HealthWithLatencyDto} HealthWithLatencyDto
 * @typedef {import("@prisma/client").PrismaClient} PrismaClient
 */

/**
 * @implements {DbHealthServicePort}
 */
export class DbHealthServicePrisma {
  /**
   * @param {Object} params
   * @param {PrismaClient} params.prismaClient
   */
  constructor({ prismaClient }) {
    this.prisma = prismaClient;
  }

  /**
   * @returns {Promise<HealthWithLatencyDto>}
   */
  async getHealth() {
    const start = Date.now();
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: "up", latencyMs: Date.now() - start };
  }
}
