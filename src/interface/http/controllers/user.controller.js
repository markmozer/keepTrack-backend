/**
 * File: src/interface/http/controllers/user.controller.js
 */

import { BadRequestError } from "../../../domain/shared/errors/index.js";
import { AppResponse } from "../AppResponse.js";

/**
 * @typedef {Object} Deps
 * @property {import("../../../application/users/CreateUser.js").CreateUser} createUserUseCase
 * @property {import("../../../application/userRoles/AssignRoleToUser.js").AssignRoleToUser} assignRoleToUserUseCase
 * @property {import("../../../application/users/InviteUser.js").InviteUser} inviteUserUseCase
 */

/**
 * @param {Deps} deps
 */
export function createUserController({
  createUserUseCase,
  assignRoleToUserUseCase,
  inviteUserUseCase,
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
    /**
     * POST /api/users/:userId/roles
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     * @param {import("express").NextFunction} next
     */
    async assignRoleToUser(req, res, next) {
      try {
        const userId = /** @type {string} */ (req.params.userId);
        const body = req.body;

        if (!body || typeof body !== "object" || Array.isArray(body)) {
          throw new BadRequestError("Body must be a JSON object.");
        }

        const { tenantId, roleId, validFrom, validTo } = body;

        const result = await assignRoleToUserUseCase.execute({
          tenantId,
          userId,
          roleId,
          validFrom,
          validTo,
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
    /**
     * POST /api/users/:userId/invite
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     * @param {import("express").NextFunction} next
     */
    async inviteUser(req, res, next) {
      try {
        const userId = /** @type {string} */ (req.params.userId);
        const body = req.body;

        if (!body || typeof body !== "object" || Array.isArray(body)) {
          throw new BadRequestError("Body must be a JSON object.");
        }

        const { tenantId } = body;

        const result = await inviteUserUseCase.execute({
          tenantId,
          userId,
        });

        res.status(200).json(AppResponse.ok(result));
        return;
      } catch (e) {
        next(e);
      }
    },
  };
}
