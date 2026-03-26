/**
 * File: keepTrack-backend/src/application/ports/system/SessionHealthServicePort.js
 */


/**
 * @typedef {import("./system.types").HealthWithLatencyDto} HealthWithLatencyDto
 */

/**
 * @typedef {Object} SessionHealthServicePort
 * @property {() => Promise<HealthWithLatencyDto>} getHealth
 */

/**
 * Runtime guard for correct dependency injection.
 *
 * @param {unknown} svc
 * @returns {asserts svc is SessionHealthService}
 */
export function assertSessionHealthService(svc) {
  const anySvc = /** @type {any} */ (svc);

  if (
    !svc ||
    typeof svc !== "object" ||
    typeof anySvc.getHealth !== "function"
  ) {
    throw new Error(
      "SessionHealthService not implemented: expected { getHealth() }"
    );
  }
}

