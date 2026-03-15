/**
 * File: src/app/buildContainer.js
 */

import { getPrisma } from "../infrastructure/persistence/prisma/prismaClient.js";

// Repositories + assert
import { TenantRepositoryPrisma } from "../infrastructure/persistence/prisma/repositories/TenantRepositoryPrisma.js";
import { assertTenantRepositoryPort } from "../application/ports/tenants/TenantRepositoryPort.js";

import { RoleRepositoryPrisma } from "../infrastructure/persistence/prisma/repositories/RoleRepositoryPrisma.js";
import { assertRoleRepositoryPort } from "../application/ports/roles/RoleRepositoryPort.js";

import { UserRepositoryPrisma } from "../infrastructure/persistence/prisma/repositories/UserRepositoryPrisma.js";
import { assertUserRepositoryPort } from "../application/ports/users/UserRepositoryPort.js";

import { UserRoleRepositoryPrisma } from "../infrastructure/persistence/prisma/repositories/UserRoleRepositoryPrisma.js";
import { assertUserRoleRepositoryPort } from "../application/ports/userRoles/UserRoleRepositoryPort.js";

// Services + assert
import { SystemClock } from "../infrastructure/services/clock/SystemClock.js";
import { assertClockServicePort } from "../application/ports/clock/ClockServicePort.js";

import { TokenServiceCrypto } from "../infrastructure/services/security/TokenServiceCrypto.js";
import { assertTokenServicePort } from "../application/ports/security/TokenServicePort.js";

import { PasswordHasherBcrypt } from "../infrastructure/services/security/PasswordHasherBcrypt.js";
import { assertPasswordServicePort } from "../application/ports/security/PasswordServicePort.js";

import { EmailServiceMock } from "../infrastructure/services/email/EmailServiceMock.js";
import { EmailServiceMicrosoftGraph } from "../infrastructure/services/email/EmailServiceMicrosoftGraph.js";
import { assertEmailServicePort } from "../application/ports/email/EmailServicePort.js";

import { CreateTenant } from "../application/tenants/CreateTenant.js";
import { GetTenantById } from "../application/tenants/GetTenantById.js";
import { CreateRole } from "../application/roles/CreateRole.js";
import { CreateUser } from "../application/users/CreateUser.js";
import { AssignRoleToUser } from "../application/userRoles/AssignRoleToUser.js";
import { InviteUser } from "../application/users/InviteUser.js";
import { AcceptInvite } from "../application/users/AcceptInvite.js";
 
/**
 * @param {string | undefined} value
 * @param {string} name
 * @returns {string}
 */
function requireEnv(value, name) {
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

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

  const clockService = new SystemClock();
  assertClockServicePort(clockService);

  const tokenService = new TokenServiceCrypto();
  assertTokenServicePort(tokenService);

  const passwordService = new PasswordHasherBcrypt();
  assertPasswordServicePort(passwordService);

  let emailService;
  if (requireEnv(process.env.EMAIL_PROVIDER, "EMAIL_PROVIDER") === "mock") {
    emailService = new EmailServiceMock();
  } else {
    emailService = new EmailServiceMicrosoftGraph({
      tenantId: requireEnv(process.env.MSAL_TENANT_ID, "MSAL_TENANT_ID"),
      clientId: requireEnv(process.env.MSAL_CLIENT_ID, "MSAL_CLIENT_ID"),
      clientSecret: requireEnv(process.env.MSAL_CLIENT_SECRET, "MSAL_CLIENT_SECRET"),
      fromEmail: requireEnv(process.env.USER_PRINCIPAL_NAME, "USER_PRINCIPAL_NAME"),
    });
  }
  assertEmailServicePort(emailService);

  const appBaseUrl = requireEnv(process.env.APP_BASE_URL, "APP_BASE_URL");
  const inviteTtlDays = 14;

  return {
    repositories: {
      tenantRepository,
      roleRepository,
      userRepository,
      userRoleRepository,
    },
    services: {
      clockService,
      tokenService,
      emailService,
      passwordService,
    },
    useCases: {
      createTenant: new CreateTenant({ tenantRepository }),
      getTenantById: new GetTenantById({ tenantRepository }),
      createRole: new CreateRole({ tenantRepository, roleRepository }),
      createUser: new CreateUser({ tenantRepository, userRepository }),
      assignRoleToUser: new AssignRoleToUser({ tenantRepository, userRepository, roleRepository, userRoleRepository}),
      inviteUser: new InviteUser({tenantRepository, userRepository, userRoleRepository, tokenService, emailService, clockService, config: {inviteTtlDays, appBaseUrl}}),
      acceptInvite: new AcceptInvite({userRepository, tokenService, clockService, passwordService}),
    },
  };
}
