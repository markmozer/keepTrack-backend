/**
 * File: keepTrack-backend/src/app/buildContainer.js
 */

import { getPrisma } from "../infrastructure/persistence/prisma/prismaClient.js";
import { TenantRepositoryPrisma } from "../infrastructure/persistence/prisma/repositories/TenantRepositoryPrisma.js";
import { assertTenantRepositoryPort } from "../application/ports/tenants/TenantRepositoryPort.js";
import { RoleRepositoryPrisma } from "../infrastructure/persistence/prisma/repositories/RoleRepositoryPrisma.js";
import { assertRoleRepositoryPort } from "../application/ports/roles/RoleRepositoryPort.js";
import { CreateTenant } from "../application/tenants/CreateTenant.js";
import { GetTenantById } from "../application/tenants/GetTenantById.js";
import { CreateRole } from "../application/roles/CreateRole.js";

export function buildContainer() {
  const prisma = getPrisma();

  const tenantRepository = new TenantRepositoryPrisma({ prisma });
  assertTenantRepositoryPort(tenantRepository);

  const roleRepository = new RoleRepositoryPrisma({ prisma });
  assertRoleRepositoryPort(roleRepository);

  return {
  repositories: {
    tenantRepository,
    roleRepository,
  },
  useCases: {
    createTenant: new CreateTenant({ tenantRepository }),
    getTenantById: new GetTenantById({ tenantRepository}),
    createRole: new CreateRole({ tenantRepository, roleRepository }),
  },
};
}