/**
 * File: src/domain/errors/toSafeJsonValue.js
 */

/**
 * @typedef {import("./AppError.js").JsonValue} JsonValue
 * @typedef {import("./AppError.js").JsonObject} JsonObject
 */

/**
 * Convert unknown input to a JSON-safe value (JsonValue).
 *
 * @param {unknown} value
 * @returns {JsonValue}
 */
export function toSafeJsonValue(value) {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(toSafeJsonValue);
  }

  if (typeof value === "object") {
    /** @type {JsonObject} */
    const result = {};

    // value is object here, but Object.entries needs a cast for good typing
    for (const [k, v] of Object.entries(/** @type {Record<string, unknown>} */ (value))) {
      result[k] = toSafeJsonValue(v);
    }

    return result;
  }

  // fallback for functions, symbols, undefined, etc.
  return String(value);
}