/**
 * File: src/tests/helpers/resetDatabase.js
 */

import { getPrisma } from "../../infrastructure/persistence/prisma/prismaClient.js";

const prisma = getPrisma();

/**
 * Clears database tables in dependency-safe order.
 * Adjust model names to your Prisma schema.
 *
 * @returns {Promise<void>}
 */
export async function resetDatabase() {
  await prisma.$transaction([
    //prisma.session?.deleteMany ? prisma.session.deleteMany() : Promise.resolve(),
    prisma.userRole?.deleteMany ? prisma.userRole.deleteMany() : Promise.resolve(),
    prisma.user?.deleteMany ? prisma.user.deleteMany() : Promise.resolve(),
    prisma.role?.deleteMany ? prisma.role.deleteMany() : Promise.resolve(),
    prisma.tenant?.deleteMany ? prisma.tenant.deleteMany() : Promise.resolve(),
  ]);
}