/**
 * File: keepTrack-backend/src/application/ports/system/DbHealthServicePort.js
 */

/**
 * @typedef {import("@prisma/client").PrismaClient} PrismaClient
 * @typedef {import("./system.types").HealthWithLatencyDto} HealthWithLatencyDto
 */

/**
 * @typedef {Object} DbHealthServicePort
 * @property {() => Promise<HealthWithLatencyDto>} getHealth
 */

/**
 * Runtime guard for correct dependency injection.
 *
 * @param {unknown} svc
 * @returns {asserts svc is DbHealthServicePort}
 */
export function assertDbHealthService(svc) {
  const anySvc = /** @type {any} */ (svc);

  if (
    !svc ||
    typeof svc !== "object" ||
    typeof anySvc.getHealth !== "function"
  ) {
    throw new Error(
      "DbHealthServicePort not implemented: expected { getHealth() }"
    );
  }
}

