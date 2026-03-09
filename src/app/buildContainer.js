/**
 * File: keepTrack-backend/src/app/buildContainer.js
 */

import { getPrisma } from "../infrastructure/persistence/prisma/prismaClient.js";
import { TenantRepositoryPrisma } from "../infrastructure/persistence/prisma/repositories/TenantRepositoryPrisma.js";
import { assertTenantRepositoryPort } from "../application/ports/tenants/TenantRepositoryPort.js";
import { CreateTenant } from "../application/tenants/CreateTenant.js";
import { GetTenantById } from "../application/tenants/GetTenantById.js";

export function buildContainer() {
  const prisma = getPrisma();

  const tenantRepository = new TenantRepositoryPrisma({ prisma });
  assertTenantRepositoryPort(tenantRepository);

  return {
  repositories: {
    tenantRepository,
  },
  useCases: {
    createTenant: new CreateTenant({ tenantRepository }),
    getTenantById: new GetTenantById({ tenantRepository}),
  },
};
}