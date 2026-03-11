/**
 * File: src/interface/http/controllers/role.controller.js
 */

import { BadRequestError } from "../../../domain/shared/errors/index.js";
import { AppResponse } from "../AppResponse.js";

/**
 * @typedef {Object} Deps
 * @property {import("../../../application/roles/CreateRole.js").CreateRole} createRoleUseCase
 */

/**
 * @param {Deps} deps
 */
export function createRoleController({
  createRoleUseCase,
}) {
  return {
    /**
     * POST /api/roles
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     * @param {import("express").NextFunction} next
     */
    async createRole(req, res, next) {
      try {
        const body = req.body;

        if (!body || typeof body !== "object" || Array.isArray(body)) {
          throw new BadRequestError("Body must be a JSON object.");
        }

        const { tenantId, name } = body;

        const role = await createRoleUseCase.execute({
          tenantId,
          name,
        });

        res.status(201).json(AppResponse.created(role));
      } catch (e) {
        next(e);
      }
    },
  };
}
