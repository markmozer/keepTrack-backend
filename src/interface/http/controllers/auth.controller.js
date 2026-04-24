/**
 * File: src/interface/http/controllers/auth.controller.js
 */

import { v } from "../../../domain/shared/validation/validators.js";
import { AppResponse } from "../AppResponse.js";
import { ValidationError } from "../../../domain/shared/errors/index.js";
import { asRequestWithContext } from "../utils/asRequestWithContext.js";

/**
 * @typedef {import("../../../application/auth/AuthenticateUser.js").AuthenticateUser} AuthenticateUser
 * @typedef {import("../../../application/sessions/GetCurrentSession.js").GetCurrentSession} GetCurrentSession
 * @typedef {import("../../../application/users/AcceptInvite.js").AcceptInvite} AcceptInvite
 * @typedef {import("../../../application/users/ForgotPassword.js").ForgotPassword} ForgotPassword
 * @typedef {import("../../../application/users/ResetPassword.js").ResetPassword} ResetPassword
 * @typedef {import("../../../application/ports/session/SessionServicePort.js").SessionServicePort} SessionServicePort
 * @typedef {import("../../../app/config/appConfig.js").CookieConfig} CookieConfig
 */

/**
 * @param {Object} params
 * @param {AuthenticateUser} params.authenticateUserUseCase
 * @param {GetCurrentSession} params.getCurrentSessionUseCase
 * @param {AcceptInvite} params.acceptInviteUseCase
 * @param {ForgotPassword} params.requestPasswordResetUseCase
 * @param {ResetPassword} params.resetPasswordUseCase
 * @param {SessionServicePort} params.sessionServicePort
 * @param {CookieConfig} params.config
 */
export function createAuthController({
  authenticateUserUseCase,
  getCurrentSessionUseCase,
  acceptInviteUseCase,
  requestPasswordResetUseCase,
  resetPasswordUseCase,
  sessionServicePort,
  config,
}) {
  return {
    /**
     * POST /api/t/:tenantSlug/auth/login
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     * @param {import("express").NextFunction} next
     */
    async authenticateUser(req, res, next) {
      try {
        const reqWithContext = asRequestWithContext(req);
        const body = v.object(reqWithContext.body, "body");

        if (!reqWithContext.context?.tenant) {
          throw new ValidationError("Invalid credentials.");
        }

        const tenantId = reqWithContext.context.tenant.id;

        const result = await authenticateUserUseCase.execute({
          principal: null,
          payload: {
            tenantId,
            email: body.email,
            passwordPlain: body.password,
          },
        });

        res.cookie(config.name, result.sessionId, {
          httpOnly: config.httpOnly,
          sameSite: config.sameSite,
          secure: config.secure,
          path: config.path,
        });

        const { sessionId, ...payload } = result;

        res.status(200).json(AppResponse.ok(payload));
      } catch (e) {
        next(e);
      }
    },

    /**
     * POST /api/t/:tenantSlug/auth/logout
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     * @param {import("express").NextFunction} next
     * @returns {Promise<void>}
     */
    async logout(req, res, next) {
      try {
        const cookieName = config.name;
        const sid = req.cookies?.[cookieName];

        if (sid) {
          await sessionServicePort.destroySession({ sessionId: sid });
        }

        res.clearCookie(config.name, {
          httpOnly: config.httpOnly,
          sameSite: config.sameSite,
          secure: config.secure,
          path: config.path,
        });

        res.status(200).json({
          success: true,
          payload: { loggedOut: true },
          error: null,
        });
      } catch (err) {
        next(err);
      }
    },
    /**
     * POST /api/t/:tenantSlug/auth/accept-invite
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     * @param {import("express").NextFunction} next
     */
    async acceptInvite(req, res, next) {
      try {
        const request = asRequestWithContext(req);
        const body = v.object(request.body, "body");

        const result = await acceptInviteUseCase.execute({
          principal: null,
          payload: {
            tenantId: request.context?.tenant?.id,
            tokenPlain: body.token,
            passwordPlain: body.password,
          },
        });

        res.status(200).json(AppResponse.ok(result));
      } catch (e) {
        next(e);
      }
    },
    /**
     * POST /api/t/:tenantSlug/auth/forgot-password
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     * @param {import("express").NextFunction} next
     */
    async requestPasswordReset(req, res, next) {
      try {
        const request = asRequestWithContext(req);
        const body = v.object(request.body, "body");

        const result = await requestPasswordResetUseCase.execute({
          principal: null,
          payload: {
            tenantId: request.context?.tenant?.id,
            email: body.email,
          },
        });

        res.status(200).json(AppResponse.ok(result));
      } catch (e) {
        next(e);
      }
    },
    /**
     * POST /api/t/:tenantSlug/auth/reset-password
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     * @param {import("express").NextFunction} next
     */
    async resetPassword(req, res, next) {
      try {
        const request = asRequestWithContext(req);
        const body = v.object(request.body, "body");

        const result = await resetPasswordUseCase.execute({
          principal: null,
          payload: {
            tenantId: request.context?.tenant?.id,
            tokenPlain: body.token,
            passwordPlain: body.password,
          },
        });

        res.status(200).json(AppResponse.ok(result));
      } catch (e) {
        next(e);
      }
    },
    /**
     * GET /api/t/:tenantSlug/auth/me
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     * @param {import("express").NextFunction} next
     * @returns {Promise<void>}
     */
    async me(req, res, next) {
      try {
        const request = asRequestWithContext(req);

        const result = await getCurrentSessionUseCase.execute({
          principal: request.principal,
          payload: {
            userId: request.principal?.userId,
            tenantId: request.principal?.tenantId,
          },
        });

        // const payload = { principal: request.principal };

        res.status(200).json({
          success: true,
          payload: result,
          error: null,
        });
      } catch (e) {
        next(e);
      }
    },
  };
}
