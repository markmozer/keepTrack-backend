/**
 * File: src/tests/helpers/seedTenant.js
 */

import { getPrisma } from "../../infrastructure/persistence/prisma/prismaClient.js";

const prisma = getPrisma();

/**
 * @typedef {Object} SeedTenantInput
 * @property {string} slug
 * @property {string} name
 */

/**
 * Seeds a tenant.
 *
 * @param {SeedTenantInput} input
 */
export async function seedTenant({ slug, name }) {
  return prisma.tenant.create({
    data: {
      slug,
      name,
    },
  });
}