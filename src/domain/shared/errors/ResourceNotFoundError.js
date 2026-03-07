/**
 * File: keepTrack/src/domain/errors/ResourceNotFoundError.js
 */
import { AppError } from "./AppError.js";

export class ResourceNotFoundError extends AppError {
  /**
   * @param {string} resource
   * @param {import("./AppError.js").ErrorDetails=} details
   */
  constructor(resource = "Resource", details) {
    super({
      statusCode: 404,
      code: "RESOURCE_NOT_FOUND",
      message: `${resource} not found`,
      details: { resource, ...(details ?? {}) },
    });
  }
}