/**
 * File: src/tests/helpers/seedUser.js
 */

/**
 * @typedef {Object} SeedRolePayload
 * @property {string} tenantId
 * @property {string} name
 */

/**
 * @typedef {Object} SeedRoleInput
 * @property {import("@prisma/client").PrismaClient} prisma
 * @property {SeedRolePayload} payload
 */

/**
 * Seeds a role
 *
 * @param {SeedRoleInput} input
 */
export async function seedRole(input) {
  const role = await input.prisma.role.create({
    data: {
      tenantId: input.payload.tenantId,
      name: input.payload.name,
    },
  });


  return role;
}