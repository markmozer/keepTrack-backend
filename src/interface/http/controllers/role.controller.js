/**
 * File: src/interface/http/controllers/role.controller.js
 */

import { v } from "../../../domain/shared/validation/validators.js";
import { createSystemPrincipal } from "../../../application/auth/systemPrincipal.js";
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
            const body = v.object(req.body, "body");
        
                const role = await createRoleUseCase.execute({
                  principal: createSystemPrincipal({ tenantId: body.tenantId }),
                  payload: {
                    name: body.name,
                  },
                });

        res.status(201).json(AppResponse.created(role));
      } catch (e) {
        next(e);
      }
    },
  };
}
