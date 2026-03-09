/**
 * File: keepTrack-backend/src/interface/http/AppResponse.js
 */


/**
 * @typedef {import("../../domain/shared/errors/AppError.js").AppError} AppError
 */

/**
 * @typedef {Object} AppErrorDto
 * @property {number} statusCode
 * @property {string=} code
 * @property {string} message
 * @property {import("../../domain/shared/errors/AppError.js").ErrorDetails=} details
 */

/**
 * @template T
 * @typedef {Object} AppResponse
 * @property {boolean} success
 * @property {T|null} payload
 * @property {AppErrorDto|null} error
 */

export const AppResponse = {
  /**
   * @template T
   * @param {T} payload
   * @returns {AppResponse<T>}
   */
  ok(payload) {
    return { success: true, payload, error: null };
  },

  /**
   * @param {AppError} err
   * @returns {AppResponse<null>}
   */
  fail(err) {
    const { statusCode, code, message, details } = err;
    return {
      success: false,
      payload: null,
      error: {
        statusCode,
        ...(code ? { code } : {}),
        message,
        ...(details !== undefined ? { details } : {}),
      },
    };
  },
};
