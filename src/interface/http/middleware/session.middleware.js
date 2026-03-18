/**
 * File: src/interface/http/middleware/session.middleware.js
 */

/**
 * @typedef {import("../../../domain/auth/Principal.js").Principal} Principal
 */

/**
 * @param {import("../../../application/ports/session/SessionServicePort.js").SessionServicePort} sessionService
 * @param {{ cookieName?: string }} [options]
 * @returns {import("express").RequestHandler}
 */
export function sessionMiddleware(sessionService, { cookieName = "sid" } = {}) {
    /**
     * @param {import("../http.types.js").RequestWithContext} req
     * @param {import("express").Response} _res
     * @param {import("express").NextFunction} next
     */
  return async (req, _res, next) => {
    try {
      const sid = req.cookies?.[cookieName];

      const session = sid
        ? await sessionService.getSession({ sessionId: sid })
        : null;

      req.session = session;

      if (!session) {
        req.principal = null;
        return next();
      }

      const roleNames = Array.from(
        new Set((session.roleNames ?? []).filter(Boolean)),
      );

      /** @type {Principal} */
      req.principal = {
        userId: session.userId,
        tenantId: session.tenantId,
        roleNames,
      };

      return next();
    } catch (err) {
      return next(err);
    }
  };
}
