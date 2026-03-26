/**
 * File: keepTrack/src/interface/system/system.router.js
 */

import express from "express";

/**
 * @param {{ systemController: any }} deps
 */
export function createSystemRouter({ systemController }) {
  const router = express.Router();

  router.get("/health", systemController.getHealth);

  return router;
}
