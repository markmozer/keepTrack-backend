/**
 * File: src/interface/http/controllers/role.controller.js
 */

import { v } from "../../../domain/shared/validation/validators.js";
import { AppResponse } from "../AppResponse.js";
import { asRequestWithContext } from "../utils/asRequestWithContext.js";

/**
 * @typedef {Object} Deps
 * @property {import("../../../application/roles/CreateRole.js").CreateRole} createRoleUseCase
 * @property {import("../../../application/roles/GetRoles.js").GetRoles} getRolesUseCase
 */

/**
 * @param {Deps} deps
 */
export function createRoleController({
  createRoleUseCase,
  getRolesUseCase,
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
        /**
     * GET /api/roles/
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     * @param {import("express").NextFunction} next
     */
    async getRoles(req, res, next) {
      try {
        const reqWithContext = asRequestWithContext(req);
        //const body = v.object(reqWithContext.body, "body");

        const result = await getRolesUseCase.execute({
          principal: reqWithContext.principal,
          payload: {
            pagination: {
              page: req.query.page ? Number(req.query.page) : undefined,
              pageSize: req.query.pageSize
                ? Number(req.query.pageSize)
                : undefined,
            },
            filters: {
              roleName:
                typeof req.query.roleName === "string"
                  ? req.query.roleName
                  : undefined,
            },
            sort: {
              field:
                typeof req.query.sortField === "string"
                  ? req.query.sortField
                  : undefined,
              direction:
                typeof req.query.sortDirection === "string"
                  ? /** @type {"asc"|"desc"} */ (req.query.sortDirection)
                  : undefined,
            },
          },
        });

        res.status(200).json(AppResponse.ok(result));
        return;
      } catch (e) {
        next(e);
      }
    },
  };
}
