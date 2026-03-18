/**
 * File: src/interface/http/controllers/user.controller.js
 */

import { v } from "../../../domain/shared/validation/validators.js";
import { createSystemPrincipal } from "../../../application/auth/systemPrincipal.js";
import { AppResponse } from "../AppResponse.js";

/**
 * @typedef {Object} Deps
 * @property {import("../../../application/users/CreateUser.js").CreateUser} createUserUseCase
 * @property {import("../../../application/users/InviteUser.js").InviteUser} inviteUserUseCase
 * @property {import("../../../application/users/AcceptInvite.js").AcceptInvite} acceptInviteUseCase
 */

/**
 * @param {Deps} deps
 */
export function createUserController({
  createUserUseCase,
  inviteUserUseCase,
  acceptInviteUseCase,
}) {
  return {
    /**
     * POST /api/users
     * @param {import("../http.types.js").RequestWithContext} req
     * @param {import("express").Response} res
     * @param {import("express").NextFunction} next
     */
    async createUser(req, res, next) {
      try {
        const body = v.object(req.body, "body");

        const user = await createUserUseCase.execute({
          principal: req.principal, //createSystemPrincipal({ tenantId: body.tenantId }),
          payload: {
            email: body.email,
          },
        });

        res.status(201).json(AppResponse.created(user));
      } catch (e) {
        next(e);
      }
    },
    /**
     * POST /api/users/:userId/invite
     * @param {import("../http.types.js").RequestWithContext} req
     * @param {import("express").Response} res
     * @param {import("express").NextFunction} next
     */
    async inviteUser(req, res, next) {
      try {
        const body = v.object(req.body, "body");
        const targetUserId = /** @type {string} */ (req.params.userId);

        const result = await inviteUserUseCase.execute({
          principal: createSystemPrincipal({ tenantId: body.tenantId }),
          payload: {
            targetUserId,
          },
        });

        res.status(200).json(AppResponse.ok(result));
        return;
      } catch (e) {
        next(e);
      }
    },
    /**
     * POST /api/users/accept-invite
     * @param {import("../http.types.js").RequestWithContext} req
     * @param {import("express").Response} res
     * @param {import("express").NextFunction} next
     */
    async acceptInvite(req, res, next) {
      try {
        const body = v.object(req.body, "body");

        const result = await acceptInviteUseCase.execute({
          principal: null,
          payload: {
            tokenPlain: body.token,
            passwordPlain: body.password,
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
