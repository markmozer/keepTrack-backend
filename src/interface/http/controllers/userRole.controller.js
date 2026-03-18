/**
 * File: src/interface/http/controllers/userRole.controller.js
 */

import { v } from "../../../domain/shared/validation/validators.js";
import { createSystemPrincipal } from "../../../application/auth/systemPrincipal.js";
import { AppResponse } from "../AppResponse.js";

/**
 * @typedef {Object} Deps
 * @property {import("../../../application/userRoles/AssignRoleToUser.js").AssignRoleToUser} assignRoleToUserUseCase
 */

/**
 * @param {Deps} deps
 */
export function createUserRoleController({ assignRoleToUserUseCase }) {
  return {
    /**
     * POST /api/users/:userId/roles
     * @param {import("../http.types.js").RequestWithContext} req
     * @param {import("express").Response} res
     * @param {import("express").NextFunction} next
     */
    async assignRoleToUser(req, res, next) {
      try {
        const body = v.object(req.body, "body");
        const targetUserId = /** @type {string} */ (req.params.userId);


        const result = await assignRoleToUserUseCase.execute({
          principal: createSystemPrincipal({ tenantId: body.tenantId }),
          payload: {
            targetUserId,
            roleId: body.roleId,
            validFrom: body.validFrom,
            validTo: body.validTo,
          },
        });

        if (result.created) {
          res.status(201).json(AppResponse.created(result.payload));
          return;
        } else {
          res.status(200).json(AppResponse.ok(result.payload));
          return;
        }
      } catch (e) {
        next(e);
      }
    },
  };
}
