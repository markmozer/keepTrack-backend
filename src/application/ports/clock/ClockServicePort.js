/**
 * File: src/application/ports/ClockServicePort.js
 */

/**
 * @typedef {Object} ClockServicePort
 * @property {() => Date} now
 * @property {(date: Date, days: number) => Date} addDays
 * @property {(date: Date, minutes: number) => Date} addMinutes
 */

/**
 * Runtime guard for correct dependency injection.
 *
 * @param {unknown} svc
 * @returns {asserts svc is ClockServicePort}
 */
export function assertClockServicePort(svc) {
  const anySvc = /** @type {any} */ (svc);

  if (
    !svc ||
    typeof svc !== "object" ||
    typeof anySvc.now !== "function" ||
    typeof anySvc.addDays !== "function" ||
    typeof anySvc.addMinutes !== "function"
  ) {
    throw new Error(
      "ClockServicePort not implemented: expected { now(), addDays(date, days), addMinutes(date, minutes) }"
    );
  }
}
