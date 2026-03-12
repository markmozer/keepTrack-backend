/**
 * File: keepTrack-backend/src/app/buildContainer.js
 */

import { getPrisma } from "../infrastructure/persistence/prisma/prismaClient.js";

import { TenantRepositoryPrisma } from "../infrastructure/persistence/prisma/repositories/TenantRepositoryPrisma.js";
import { assertTenantRepositoryPort } from "../application/ports/tenants/TenantRepositoryPort.js";

import { RoleRepositoryPrisma } from "../infrastructure/persistence/prisma/repositories/RoleRepositoryPrisma.js";
import { assertRoleRepositoryPort } from "../application/ports/roles/RoleRepositoryPort.js";

import { UserRepositoryPrisma } from "../infrastructure/persistence/prisma/repositories/UserRepositoryPrisma.js";
import { assertUserRepositoryPort } from "../application/ports/users/UserRepositoryPort.js";

import { UserRoleRepositoryPrisma } from "../infrastructure/persistence/prisma/repositories/UserRoleRepositoryPrisma.js";
import { assertUserRoleRepositoryPort } from "../application/ports/userRoles/UserRoleRepositoryPort.js";

import { CreateTenant } from "../application/tenants/CreateTenant.js";
import { GetTenantById } from "../application/tenants/GetTenantById.js";
import { CreateRole } from "../application/roles/CreateRole.js";
import { CreateUser } from "../application/users/CreateUser.js";
import { AssignRoleToUser } from "../application/userRoles/AssignRoleToUser.js";

export function buildContainer() {
  const prisma = getPrisma();

  const tenantRepository = new TenantRepositoryPrisma({ prisma });
  assertTenantRepositoryPort(tenantRepository);

  const roleRepository = new RoleRepositoryPrisma({ prisma });
  assertRoleRepositoryPort(roleRepository);

  const userRepository = new UserRepositoryPrisma({ prisma });
  assertUserRepositoryPort(userRepository);

  const userRoleRepository = new UserRoleRepositoryPrisma({ prisma });
  assertUserRoleRepositoryPort(userRoleRepository);

  return {
    repositories: {
      tenantRepository,
      roleRepository,
      userRepository,
      userRoleRepository,
    },
    useCases: {
      createTenant: new CreateTenant({ tenantRepository }),
      getTenantById: new GetTenantById({ tenantRepository }),
      createRole: new CreateRole({ tenantRepository, roleRepository }),
      createUser: new CreateUser({ tenantRepository, userRepository }),
      assignRoleToUser: new AssignRoleToUser({ tenantRepository, userRepository, roleRepository, userRoleRepository})
    },
  };
}
