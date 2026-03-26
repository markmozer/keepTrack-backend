/**
 * File: keepTrack/src/interface/system/system.controller.js
 */

import { v } from "../../../domain/shared/validation/validators.js";
import { AppResponse } from "../AppResponse.js";
import { asRequestWithContext } from "../utils/asRequestWithContext.js";

/**
 * @typedef {Object} Deps
 * @property {import("../../../application/system/GetSystemHealth.js").GetSystemHealth} getSystemHealthUseCase
 */

/**
 * @param {Deps} deps
 */
export function createSystemController({ getSystemHealthUseCase }) {
  return {
    /**
     * POST /system
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     * @param {import("express").NextFunction} next
     */
    async getHealth(req, res, next) {
      try {
        const reqWithContext = asRequestWithContext(req);    
        // const body = v.object(reqWithContext.body, "body");

        const payload = await getSystemHealthUseCase.execute();
        res.status(200).json(AppResponse.ok(payload));
      } catch (err) {
        next(err);
      }
    },
  };
}
