/**
 * File: keepTrack-backend/src/infrastructure/persistance/prisma/prismaClient.js
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getPgPool } from "./pgPool.js";

/** @type {(import("@prisma/client").PrismaClient)} prisma  */
let prisma;

/**
 * Singleton PrismaClient (using PrismaPg adapter)
 */
export function getPrisma() {
  if (prisma) return prisma;

  const pool = getPgPool();
  const adapter = new PrismaPg(pool);

  prisma = new PrismaClient({ adapter });

  return prisma;
}
