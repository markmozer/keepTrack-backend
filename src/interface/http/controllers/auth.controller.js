/**
 * File: src/interface/http/controllers/auth.controller.js
 */

import { v } from "../../../domain/shared/validation/validators.js";
import { AppResponse } from "../AppResponse.js";
import { ValidationError } from "../../../domain/shared/errors/index.js";
import { asRequestWithContext } from "../utils/asRequestWithContext.js";

/**
 * @typedef {import("../../../application/auth/AuthenticateUser.js").AuthenticateUser} AuthenticateUser
 * @typedef {import("../../../application/ports/session/SessionServicePort.js").SessionServicePort} SessionServicePort
 * @typedef {import("../../../app/config/appConfig.js").CookieConfig} CookieConfig
 */

/**
   * @param {Object} params
   * @param {AuthenticateUser} params.authenticateUserUseCase
   * @param {SessionServicePort} params.sessionServicePort
   * @param {CookieConfig} params.config
   */
export function createAuthController({
  authenticateUserUseCase,
  sessionServicePort,
  config,
}) {
  return {
    /**
     * POST /api/auth/login
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
     * POST /api/auth/logout
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
     * POST /api/auth/me
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     * @param {import("express").NextFunction} next
     * @returns {Promise<void>}
     */
    async me(req, res, next) {
      try {
        const request = asRequestWithContext(req);

        const payload = {principal: request.principal}

        res.status(200).json({
          success: true,
          payload,
          error: null,
        });
      } catch (e) {
        next(e);
      }
    },
  };
}
