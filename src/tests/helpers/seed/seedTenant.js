/**
 * File: src/tests/helpers/seed/seedTenant.js
 */
import { tenantFactory } from "../factories/tenantFactory.js";

/**
 * @param {Object} params
 * @param {import("@prisma/client").PrismaClient} params.prisma
 * @param {Object} [params.payload]
 */
export async function seedTenant({ prisma, payload = {} }) {
  const data = tenantFactory(payload);

  return prisma.tenant.create({
    data,
  });
}