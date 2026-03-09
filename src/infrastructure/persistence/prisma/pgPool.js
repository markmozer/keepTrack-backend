/**
 * File: keepTrack-backend/src/infrastructure/persistance/prisma/pgPool.js
 */

import pg from "pg";

/** @type {import("pg").Pool | undefined} pool */
let pool;

/**
 * 
 * @returns {import("pg").Pool}
 */
export function getPgPool() {
  if (pool) return pool;

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });

  return pool;
}
