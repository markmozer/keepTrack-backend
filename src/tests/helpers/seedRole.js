/**
 * File: src/tests/helpers/seedUser.js
 */

import { getPrisma } from "../../infrastructure/persistence/prisma/prismaClient.js";

const prisma = getPrisma();

/**
 * @typedef {Object} SeedRoleInput
 * @property {string} tenantId
 * @property {string} name
 */

/**
 * Seeds a role
 *
 * @param {SeedRoleInput} input
 */
export async function seedRole({
  tenantId,
  name,
}) {
  const role = await prisma.role.create({
    data: {
      tenantId,
      name,
    },
  });


  return role;
}