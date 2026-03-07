/**
 * File: src/domain/errors/AppError.js
 */

/**
 * @typedef {null | boolean | number | string} JsonPrimitive
 * @typedef {JsonPrimitive | JsonObject | JsonArray} JsonValue
 * @typedef {JsonValue[]} JsonArray
 * @typedef {{ [key: string]: JsonValue }} JsonObject
 *
 * @typedef {JsonObject} ErrorDetails
 */

export class AppError extends Error {
  /**
   * @param {{
   *   statusCode: number,
   *   code: string,
   *   message: string,
   *   details?: ErrorDetails
   * }} args
   */
  constructor({ statusCode, code, message, details }) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
  }
}

export {};
