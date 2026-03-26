/**
 * File: src/app/buildContainer.js
 */

import { loadAppConfig } from "../shared/config/appConfig.js";
import { createPrisma } from "../infrastructure/persistence/prisma/prismaClient.js";
import { RedisClient } from "../infrastructure/services/redis/RedisClient.js";
import { SessionStoreRedis } from "../infrastructure/services/session/SessionStoreRedis.js";
import { SessionServiceRedis } from "../infrastructure/services/session/SessionServiceRedis.js";

// Repositories
import { TenantRepositoryPrisma } from "../infrastructure/persistence/prisma/repositories/TenantRepositoryPrisma.js";
import { RoleRepositoryPrisma } from "../infrastructure/persistence/prisma/repositories/RoleRepositoryPrisma.js";
import { UserRepositoryPrisma } from "../infrastructure/persistence/prisma/repositories/UserRepositoryPrisma.js";
import { UserRoleRepositoryPrisma } from "../infrastructure/persistence/prisma/repositories/UserRoleRepositoryPrisma.js";

// Services
import { SystemClock } from "../infrastructure/services/clock/SystemClock.js";
import { TokenServiceCrypto } from "../infrastructure/services/security/TokenServiceCrypto.js";
import { PasswordHasherBcrypt } from "../infrastructure/services/security/PasswordHasherBcrypt.js";
import { EmailServiceMock } from "../infrastructure/services/email/EmailServiceMock.js";
import { EmailServiceMicrosoftGraph } from "../infrastructure/services/email/EmailServiceMicrosoftGraph.js";
import { TenantInviteLinkBuilder } from "../infrastructure/services/url/TenantInviteLinkBuilder.js";
import { DbHealthServicePrisma } from "../infrastructure/services/db/DbHealthServicePrisma.js";
import { SessionHealthServiceRedis } from "../infrastructure/services/session/SessionHealthServiceRedis.js";

// Use-Cases
import { ProvisionBaseTenant } from "../application/provisioning/ProvisionBaseTenant.js";
import { CreateTenant } from "../application/tenants/CreateTenant.js";
import { GetTenantById } from "../application/tenants/GetTenantById.js";
import { CreateRole } from "../application/roles/CreateRole.js";
import { CreateUser } from "../application/users/CreateUser.js";
import { AssignRoleToUser } from "../application/userRoles/AssignRoleToUser.js";
import { InviteUser } from "../application/users/InviteUser.js";
import { AcceptInvite } from "../application/users/AcceptInvite.js";
import { AuthenticateUser } from "../application/auth/AuthenticateUser.js";
import { AuthorizeAction } from "../application/authz/AuthorizeAction.js";
import { RolePolicy } from "../domain/authz/RolePolicy.js";
import { permissionsByRole } from "../domain/authz/permissionsByRole.js";
import { GetAppHealth } from "../application/system/GetAppHealth.js";
import { GetDbHealth } from "../application/system/GetDbHealth.js";
import { GetSessionHealth } from "../application/system/GetSessionHealth.js";
import { GetSystemHealth } from "../application/system/GetSystemHealth.js";

export function buildContainer() {
  const appConfig = loadAppConfig();

  // --- Infrastructure ---
  const prisma = createPrisma({
    config: appConfig.database,
  });

  const redisClient = new RedisClient({
    config: appConfig.session,
  });

  const sessionStore = new SessionStoreRedis({
    redisClient: redisClient.client,
    config: appConfig.session,
  });

  const sessionService = new SessionServiceRedis({
    sessionStore,
    config: appConfig.session,
  });

  const clockService = new SystemClock();
  const tokenService = new TokenServiceCrypto();
  const passwordService = new PasswordHasherBcrypt();

  let emailService;

  switch (appConfig.email.provider) {
    case "mock":
      emailService = new EmailServiceMock();
      break;

    case "msgraph": {
      const msgraph = appConfig.email.msgraph;
      if (!msgraph) {
        throw new Error("Missing msgraph config.");
      }

      emailService = new EmailServiceMicrosoftGraph({
        config: msgraph,
      });
      break;
    }
    default:
      throw new Error(
        `Unsupported email provider: ${appConfig.email.provider}`,
      );
  }

  const inviteLinkBuilder = new TenantInviteLinkBuilder({
    config: appConfig.frontend,
  });

  const dbHealthService = new DbHealthServicePrisma({prismaClient: prisma});
  const sessionHealthService = new SessionHealthServiceRedis({redisClient: redisClient.client});

  // --- Repositories ---
  const tenantRepository = new TenantRepositoryPrisma({ prisma });
  const roleRepository = new RoleRepositoryPrisma({ prisma });
  const userRepository = new UserRepositoryPrisma({ prisma });
  const userRoleRepository = new UserRoleRepositoryPrisma({ prisma });

  const repositories = {
    tenantRepository,
    roleRepository,
    userRepository,
    userRoleRepository,
  };

  const services = {
    sessionService,
    clockService,
    tokenService,
    passwordService,
    emailService,
    inviteLinkBuilder,
    dbHealthService,
    sessionHealthService,
  };

  // --- Use cases ---
  const policy = new RolePolicy({ permissionsByRole });

  const provisionBaseTenant = new ProvisionBaseTenant({
    tenantRepository,
    roleRepository,
    userRepository,
    userRoleRepository,
    tokenService,
    clockService,
  });

  const authenticateUser = new AuthenticateUser({
    userRepository,
    userRoleRepository,
    passwordService,
    sessionService,
    clockService,
  });
  const authorizeAction = new AuthorizeAction({ policy });
  const createTenant = new CreateTenant({ tenantRepository, authorizeAction });
  const getTenantById = new GetTenantById({
    tenantRepository,
    authorizeAction,
  });
  const createRole = new CreateRole({
    tenantRepository,
    roleRepository,
    authorizeAction,
  });
  const createUser = new CreateUser({
    tenantRepository,
    userRepository,
    authorizeAction,
  });
  const assignRoleToUser = new AssignRoleToUser({
    tenantRepository,
    userRepository,
    roleRepository,
    userRoleRepository,
    authorizeAction,
  });
  const inviteUser = new InviteUser({
    tenantRepository,
    userRepository,
    userRoleRepository,
    tokenService,
    emailService,
    clockService,
    inviteLinkBuilder,
    authorizeAction,
    config: appConfig.auth,
  });
  const acceptInvite = new AcceptInvite({
    userRepository,
    tokenService,
    clockService,
    passwordService,
  });
  const getAppHealth = new GetAppHealth();
  const getDbHealth = new GetDbHealth({
    dbHealthService,
  });
  const getSessionHealth = new GetSessionHealth({
    sessionHealthService,
  });
  const getSystemHealth = new GetSystemHealth({
    getAppHealth,
    getDbHealth,
    getSessionHealth,
  });

  const useCases = {
    authenticateUser,
    authorizeAction,
    createTenant,
    getTenantById,
    createRole,
    createUser,
    assignRoleToUser,
    inviteUser,
    acceptInvite,
    getAppHealth,
    getDbHealth,
    getSessionHealth,
    getSystemHealth,
  };

  const provisioning = {
    provisionBaseTenant,
  };

  // --- Other ---
  async function shutdown() {
    await prisma.$disconnect();
    await redisClient.client.quit();
  }

  return {
    appConfig,
    prisma,
    repositories,
    services,
    useCases,
    provisioning,
    shutdown,
  };
}
