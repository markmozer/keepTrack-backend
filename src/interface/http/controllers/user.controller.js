/**
 * File: src/interface/http/controllers/user.controller.js
 */

import { v } from "../../../domain/shared/validation/validators.js";
import { AppResponse } from "../AppResponse.js";
import { asRequestWithContext } from "../utils/asRequestWithContext.js";

/**
 * @typedef {Object} Deps
 * @property {import("../../../application/users/CreateUser.js").CreateUser} createUserUseCase
 * @property {import("../../../application/users/InviteUser.js").InviteUser} inviteUserUseCase
 * @property {import("../../../application/users/AcceptInvite.js").AcceptInvite} acceptInviteUseCase
 * @property {import("../../../application/users/RequestPasswordReset.js").RequestPasswordReset} requestPasswordResetUseCase
 */

/**
 * @param {Deps} deps
 */
export function createUserController({
  createUserUseCase,
  inviteUserUseCase,
  acceptInviteUseCase,
  requestPasswordResetUseCase,
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
        const reqWithContext = asRequestWithContext(req);
        const body = v.object(reqWithContext.body, "body");

        const user = await createUserUseCase.execute({
          principal: reqWithContext.principal,
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
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     * @param {import("express").NextFunction} next
     */
    async inviteUser(req, res, next) {
      try {
        const reqWithContext = asRequestWithContext(req);
        const body = v.object(reqWithContext.body, "body");
        const targetUserId = reqWithContext.params.userId;

        const result = await inviteUserUseCase.execute({
          principal: reqWithContext.principal,
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
     * @param {import("express").Request} req
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
    /**
     * POST /api/users/accept-invite
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     * @param {import("express").NextFunction} next
     */
    async requestPasswordReset(req, res, next) {
      try {
        const reqWithContext = asRequestWithContext(req);
        const body = v.object(reqWithContext.body, "body");

        const result = await requestPasswordResetUseCase.execute({
          principal: null,
          payload: {
            tenantId: reqWithContext.context?.tenant?.id,
            email: body.email,
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
