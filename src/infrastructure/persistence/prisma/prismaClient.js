/**
 * File: src/infrastructure/persistance/prisma/prismaClient.js
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

/**
 * @typedef {import("../../../shared/config/appConfig.js").DatabaseConfig} DatabaseConfig
 */

/**
 * @param {Object} params
 * @param {DatabaseConfig} params.config
 */
export function createPrisma({ config }) {
  if (!config?.url) {
    throw new Error("Missing database url");
  }

  const pool = new pg.Pool({
    connectionString: config.url,
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
}