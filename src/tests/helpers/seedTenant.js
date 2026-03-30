/**
 * File: src/tests/helpers/seedTenant.js
 */

/**
 * @typedef {Object} SeedTenantPayload
 * @property {string} slug
 * @property {string} name
 * @property {string} type
 */

/**
 * @typedef {Object} SeedTenantInput
 * @property {import("@prisma/client").PrismaClient} prisma
 * @property {SeedTenantPayload} payload
 */


/**
 * Seeds a tenant.
 *
 * @param {SeedTenantInput} input
 */
export async function seedTenant(input) {
  return input.prisma.tenant.create({
    data: {
      slug: input.payload.slug,
      name: input.payload.name,
      type: input.payload.type,
    },
  });
}