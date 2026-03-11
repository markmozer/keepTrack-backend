/**
 * File: src/interface/http/controllers/user.controller.js
 */

import { BadRequestError } from "../../../domain/shared/errors/index.js";
import { AppResponse } from "../AppResponse.js";

/**
 * @typedef {Object} Deps
 * @property {import("../../../application/users/CreateUser.js").CreateUser} createUserUseCase
 */

/**
 * @param {Deps} deps
 */
export function createUserController({
  createUserUseCase,
}) {
  return {
    /**
     * POST /api/users
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     * @param {import("express").NextFunction} next
     */
    async createUser(req, res, next) {
      try {
        const body = req.body;

        if (!body || typeof body !== "object" || Array.isArray(body)) {
          throw new BadRequestError("Body must be a JSON object.");
        }

        const { tenantId, email } = body;

        const user = await createUserUseCase.execute({
          tenantId,
          email,
        });

        res.status(201).json(AppResponse.created(user));
      } catch (e) {
        next(e);
      }
    },
  };
}
