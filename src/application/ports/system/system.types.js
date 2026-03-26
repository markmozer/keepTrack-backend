/**
 * @typedef {"up" | "down" | "degraded" | "unknown"} HealthStatus
 */

/**
 * @typedef {Object} HealthDto
 * @property {HealthStatus} status
 */

/**
 * @typedef {HealthDto & { latencyMs: number }} HealthWithLatencyDto
 */

/**
 * @typedef {Object} SystemHealthDto
 * @property {HealthDto} app
 * @property {HealthWithLatencyDto} db
 * @property {HealthWithLatencyDto} sessions
 * @property {{
 *   timestamp: string,
 *   uptimeSeconds: number,
 * }} meta
 */

export {};
