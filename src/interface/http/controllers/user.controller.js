/**
 * File: src/interface/http/controllers/user.controller.js
 */

import { v } from "../../../domain/shared/validation/validators.js";
import { AppResponse } from "../AppResponse.js";
import { asRequestWithContext } from "../utils/asRequestWithContext.js";

/**
 * @param {Object} deps
 * @param {import("../../../application/users/CreateUser.js").CreateUser} deps.createUserUseCase
 * @param {import("../../../application/users/InviteUser.js").InviteUser} deps.inviteUserUseCase
 * @param {import("../../../application/users/AcceptInvite.js").AcceptInvite} deps.acceptInviteUseCase
 * @param {import("../../../application/users/ForgotPassword.js").ForgotPassword} deps.requestPasswordResetUseCase
 * @param {import("../../../application/users/ResetPassword.js").ResetPassword} deps.resetPasswordUseCase
 * @param {import("../../../application/users/GetUsers.js").GetUsers} deps.getUsersUseCase
 */
export function createUserController({
  createUserUseCase,
  inviteUserUseCase,
  acceptInviteUseCase,
  requestPasswordResetUseCase,
  resetPasswordUseCase,
  getUsersUseCase,
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
     * POST /api/users/forgot-password
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
    /**
     * POST /api/users/reset-password
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     * @param {import("express").NextFunction} next
     */
    async resetPassword(req, res, next) {
      try {
        const body = v.object(req.body, "body");

        const result = await resetPasswordUseCase.execute({
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
     * GET /api/users/
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     * @param {import("express").NextFunction} next
     */
    async getUsers(req, res, next) {
      try {
        const reqWithContext = asRequestWithContext(req);
        //const body = v.object(reqWithContext.body, "body");

        const result = await getUsersUseCase.execute({
          principal: reqWithContext.principal,
          payload: {
            pagination: {
              page: req.query.page ? Number(req.query.page) : undefined,
              pageSize: req.query.pageSize
                ? Number(req.query.pageSize)
                : undefined,
            },
            filters: {
              email:
                typeof req.query.email === "string"
                  ? req.query.email
                  : undefined,
              status:
                typeof req.query.status === "string"
                  ? /** @type {any} */ (req.query.status)
                  : undefined,
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
