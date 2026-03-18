/**
 * File: src/interface/http/controllers/auth.controller.js
 */

import { v } from "../../../domain/shared/validation/validators.js";
import { AppResponse } from "../AppResponse.js";
import { ValidationError } from "../../../domain/shared/errors/index.js";

/**
 * @typedef {Object} Deps
 * @property {import("../../../application/auth/AuthenticateUser.js").AuthenticateUser} authenticateUserUseCase
 * @property {import("../../../application/ports/session/SessionServicePort.js").SessionServicePort} sessionServicePort
 */

/**
 * @param {Deps} deps
 */
export function createAuthController({
  authenticateUserUseCase,
  sessionServicePort,
}) {
  return {
    /**
     * POST /api/auth/login
     * @param {import("../http.types.js").RequestWithContext} req
     * @param {import("express").Response} res
     * @param {import("express").NextFunction} next
     */
    async authenticateUser(req, res, next) {
      try {
        const body = v.object(req.body, "body");

        if (!req.context?.tenant) {
          throw new ValidationError("Invalid credentials.");
        }

        const tenantId = req.context.tenant.id;

        const result = await authenticateUserUseCase.execute({
          principal: null,
          payload: {
            tenantId,
            email: body.email,
            passwordPlain: body.password,
          },
        });

        const cookieName = process.env.SESSION_COOKIE_NAME ?? "sid";

        res.cookie(cookieName, result.sessionId, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
        });

        const { sessionId, ...payload } = result;

        res.status(200).json(AppResponse.ok(payload));
      } catch (e) {
        next(e);
      }
    },

    /**
     * POST /api/auth/logout
     * @param {import("../http.types.js").RequestWithContext} req
     * @param {import("express").Response} res
     * @param {import("express").NextFunction} next
     * @returns {Promise<void>}
     */
    async logout(req, res, next) {
      try {
        const cookieName = process.env.SESSION_COOKIE_NAME ?? "sid";
        const sid = req.cookies?.[cookieName];

        if (sid) {
          await sessionServicePort.destroySession({ sessionId: sid });
        }

        res.clearCookie(cookieName, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
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
     * POST /api/auth/logout
     * @param {import("../http.types.js").RequestWithContext} req
     * @param {import("express").Response} res
     * @param {import("express").NextFunction} next
     * @returns {Promise<void>}
     */
    async me(req, res, next) {
      try {
        const request =
          /** @type {import("../http.types.js").RequestWithContext} */ (req);

        res.status(200).json({
          success: true,
          payload: request.principal,
          error: null,
        });
      } catch (e) {
        next(e);
      }
    },
  };
}
