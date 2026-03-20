/**
 * File: src/domain/validation/validators.js
 */

// @ts-check

import { ValidationError } from "../errors/index.js";
import { toSafeJsonValue } from "../errors/toSafeJsonValue.js";

/**
 * @typedef {Object} StringOptions
 * @property {boolean} [trim]
 * @property {number} [min]
 * @property {number} [max]
 * @property {RegExp} [pattern]
 *
 * @typedef {Object} NumberOptions
 * @property {boolean} [integer]
 * @property {number} [min]
 * @property {number} [max]
 *
 * @typedef {Object} ArrayOptions
 * @property {number} [min]
 * @property {number} [max]
 * @property {(item: any, name: string) => void} [element]
 *
 * @typedef {Object} ObjectOptions
 * @property {string[]} [allowedKeys]
 * @property {string[]} [requiredKeys]
 */

/**
 * @param {string} message
 * @param {Record<string, any>=} details
 * @throws {ValidationError}
 */
function fail(message, details) {
  throw new ValidationError(message, details);
}

export const v = {
  /**
   * @param {any} value
   * @param {string} name
   * @returns {any}
   */
  required(value, name) {
    if (value === undefined)
      fail(`${name} is required`, { [name]: "undefined" });
    if (value === null) fail(`${name} is required`, { [name]: "null" });
    return value;
  },

  /**
   * Validates and optionally trims a string.
   * @param {any} value
   * @param {string} name
   * @param {StringOptions} [options]
   * @returns {string}
   */
  string(value, name, { trim = true, min, max, pattern } = {}) {
    v.required(value, name);
    if (typeof value !== "string")
      fail(`${name} must be a string`, { [name]: typeof value });

    const s = trim ? value.trim() : value;
    if (trim && s.length === 0)
      fail(`${name} must not be empty`, { [name]: "empty" });
    if (min != null && s.length < min)
      fail(`${name} must be at least ${min} chars`, { [name]: s.length });
    if (max != null && s.length > max)
      fail(`${name} must be at most ${max} chars`, { [name]: s.length });
    if (pattern && !pattern.test(s))
      fail(`${name} is invalid`, { [name]: "pattern" });

    return s;
  },

  /**
   * Validates a number.
   * @param {any} value
   * @param {string} name
   * @param {NumberOptions} [options]
   * @returns {number}
   */
  number(value, name, { integer = false, min, max } = {}) {
    v.required(value, name);
    if (typeof value !== "number")
      fail(`${name} must be a number`, { [name]: typeof value });
    if (Number.isNaN(value)) fail(`${name} must not be NaN`, { [name]: "NaN" });
    if (!Number.isFinite(value))
      fail(`${name} must be finite`, { [name]: "infinite" });
    if (integer && !Number.isInteger(value))
      fail(`${name} must be an integer`, { [name]: value });
    if (min != null && value < min)
      fail(`${name} must be >= ${min}`, { [name]: value });
    if (max != null && value > max)
      fail(`${name} must be <= ${max}`, { [name]: value });
    return value;
  },

  /**
   * Validates a boolean.
   * @param {any} value
   * @param {string} name
   * @returns {boolean}
   */
  boolean(value, name) {
    v.required(value, name);
    if (typeof value !== "boolean")
      fail(`${name} must be a boolean`, { [name]: typeof value });
    return value;
  },

  /**
   * Validates an array (and optionally each element).
   * @param {any} value
   * @param {string} name
   * @param {ArrayOptions} [options]
   * @returns {any[]}
   */
  array(value, name, { min, max, element } = {}) {
    v.required(value, name);
    if (!Array.isArray(value)) {
      fail(`${name} must be an array`, { [name]: typeof value });
    }

    // ✅ vanaf hier: geef TS een context type
    const arr = /** @type {any[]} */ (value);

    if (min != null && arr.length < min)
      fail(`${name} must have at least ${min} items`, { [name]: arr.length });
    if (max != null && arr.length > max)
      fail(`${name} must have at most ${max} items`, { [name]: arr.length });

    if (element) {
      arr.forEach((item, i) => element(item, `${name}[${i}]`));
    }

    return arr;
  },
  /**
   * Validates a plain object (non-array), optionally enforcing required/allowed keys.
   * @param {any} value
   * @param {string} name
   * @param {ObjectOptions} [options]
   * @returns {Record<string, any>}
   */
  object(value, name, { allowedKeys, requiredKeys } = {}) {
    v.required(value, name);
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      fail(`${name} must be an object`, { [name]: typeof value });
    }

    if (requiredKeys) {
      for (const k of requiredKeys) {
        if (!(k in value))
          fail(`${name}.${k} is required`, { [`${name}.${k}`]: "missing" });
      }
    }
    if (allowedKeys) {
      for (const k of Object.keys(value)) {
        if (!allowedKeys.includes(k))
          fail(`${name}.${k} is not allowed`, { [`${name}.${k}`]: "unknown" });
      }
    }
    return /** @type {Record<string, any>} */ (value);
  },

  /**
   * Validates a UUID.
   * @param {any} value
   * @param {string} name
   * @returns {string}
   */
  uuid(value, name) {
    v.required(value, name);

    if (typeof value !== "string") {
      fail(`${name} must be a string UUID`, { [name]: value });
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(value)) {
      fail(`${name} is not a valid UUID`, { [name]: value });
    }

    return value;
  },

  /**
   * Validate & parse a date-ish input into a real Date instance.
   *
   * Accepts:
   *  - Date instance
   *  - string (e.g. "2026-03-04", "2026-03-04T10:00:00.000Z")
   *  - number (epoch ms) OPTIONAL (disabled by default)
   */

  /**
   * @overload
   * @param {unknown} value
   * @param {string} field
   * @param {{
   *   nullable?: false,
   *   emptyAsNull?: boolean,
   *   minLen?: number,
   *   maxLen?: number,
   *   allowNumber?: boolean,
   * }} [opts]
   * @returns {Date}
   */

  /**
   * @overload
   * @param {unknown} value
   * @param {string} field
   * @param {{
   *   nullable: true,
   *   emptyAsNull?: boolean,
   *   minLen?: number,
   *   maxLen?: number,
   *   allowNumber?: boolean,
   * }} opts
   * @returns {Date|null}
   */

  /**
   * @param {unknown} value
   * @param {string} field
   * @param {{
   *   nullable?: boolean,
   *   emptyAsNull?: boolean,
   *   minLen?: number,
   *   maxLen?: number,
   *   allowNumber?: boolean,
   * }} [opts]
   * @returns {Date|null}
   */
  date(value, field, opts = {}) {
    const {
      nullable = false,
      emptyAsNull = false,
      minLen = 1,
      maxLen = 40,
      allowNumber = false,
    } = opts;

    // null/undefined handling
    if (value == null) {
      if (nullable) return null;
      fail(`${field} is required`, { [field]: value });
    }

    // empty string handling (common from forms)
    if (emptyAsNull && typeof value === "string" && value.trim() === "") {
      if (nullable) return null;
      fail(`${field} is required`, { [field]: value });
    }

    // Date instance
    if (value instanceof Date) {
      if (Number.isNaN(value.getTime()))
        fail(`${field} must be a valid date`, { [field]: value });
      return value;
    }

    // number (epoch ms)
    if (allowNumber && typeof value === "number") {
      const d = new Date(value);
      if (Number.isNaN(d.getTime()))
        fail(`${field} must be a valid date`, { [field]: value });
      return d;
    }

    // string
    const raw = v.string(value, field, { min: minLen, max: maxLen });
    const d = new Date(raw);

    if (Number.isNaN(d.getTime())) {
      fail(`${field} must be a valid date`, { [field]: raw });
    }

    return d;
  },
  /**
 * @template {Record<string, string>} TEnum
 * @param {unknown} raw
 * @param {TEnum} enumObj
 * @param {string} fieldName
 * @param {TEnum[keyof TEnum] | undefined} def 
 * @returns {TEnum[keyof TEnum]}
 */
EnumStringOrDefault(raw, enumObj, fieldName, def) {
  if (raw == null && def) return def;
  if (raw == null && !def) {
    throw new ValidationError(`${fieldName} must be a string`, { received: toSafeJsonValue(raw) });
  }
  if (typeof raw !== "string") {
    throw new ValidationError(`${fieldName} must be a string`, { received: toSafeJsonValue(raw) });
  }
  const s = raw.trim();
  if (s === "" && def ) return def;
  if (s === "" && !def ) {
    throw new ValidationError(`${fieldName} must be a string`, { received: toSafeJsonValue(raw) });
  }

  const normalized = s.toUpperCase();
  if (!Object.values(enumObj).includes(normalized)) {
    throw new ValidationError(`${fieldName} is invalid`, {
      received: s,
      allowed: Object.values(enumObj),
    });
  }
  return /** @type {any} */ (normalized);
}
};
