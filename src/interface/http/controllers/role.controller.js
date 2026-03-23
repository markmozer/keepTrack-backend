/**
 * File: src/interface/http/controllers/role.controller.js
 */

import { v } from "../../../domain/shared/validation/validators.js";
import { AppResponse } from "../AppResponse.js";
import { asRequestWithContext } from "../utils/asRequestWithContext.js";

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
        const reqWithContext = asRequestWithContext(req);    
        const body = v.object(reqWithContext.body, "body");
            
                const role = await createRoleUseCase.execute({
                  principal: reqWithContext.principal,
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
