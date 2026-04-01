/**
 * File: src/tests/helpers/seed/seedRole.js
 */

import { roleFactory } from "../factories/roleFactory.js";

export async function seedRole({ prisma, payload = {} }) {
  const data = roleFactory(payload);



  return prisma.role.upsert({
    where: {tenantId_name: {tenantId: payload.tenantId, name: data.name} },
    update: {},
    create: {tenantId: payload.tenantId, name: data.name},
  });
}