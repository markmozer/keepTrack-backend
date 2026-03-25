/**
 * File: keepTrack-backend/src/shared/config/env.js
 */


/**
 * @param {string} name
 * @returns {string}
 */
export function requireEnv(name) {
  const value = process.env[name];

  if (value == null || value === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

/**
 * @param {string} name
 * @param {string} defaultValue
 * @returns {string}
 */
export function getEnv(name, defaultValue) {
  const value = process.env[name];
  return value == null || value === "" ? defaultValue : value;
}