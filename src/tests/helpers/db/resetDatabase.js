/**
 * File: src/tests/helpers/resetDatabase.js
 */


/**
 * Clears database tables in dependency-safe order.
 *
 * @returns {Promise<void>}
 */
export async function resetDatabase({prisma}) {
  await prisma.$transaction([
    prisma.userRole?.deleteMany ? prisma.userRole.deleteMany() : Promise.resolve(),
    prisma.user?.deleteMany ? prisma.user.deleteMany() : Promise.resolve(),
    prisma.role?.deleteMany ? prisma.role.deleteMany() : Promise.resolve(),
    prisma.tenant?.deleteMany ? prisma.tenant.deleteMany() : Promise.resolve(),
  ]);
}