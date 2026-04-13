/**
 * File: src/app/buildContainer.js
 */

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
import { TenantLinkBuilderService } from "../infrastructure/services/url/TenantLinkBuilderService.js";
import { DbHealthServicePrisma } from "../infrastructure/services/db/DbHealthServicePrisma.js";
import { SessionHealthServiceRedis } from "../infrastructure/services/session/SessionHealthServiceRedis.js";

// Provisioning
import { ProvisionTenant } from "../application/provisioning/ProvisionTenant.js";
import { ProvisionTenantRoles } from "../application/provisioning/ProvisionTenantRoles.js";
import { ProvisionTenantAdminUser } from "../application/provisioning/ProvisionTenantAdminUser.js";
import { ProvisionTenantAdminUserRole } from "../application/provisioning/ProvisionTenantAdminUserRole.js";
import { ProvisionTenantInviteAdminUser } from "../application/provisioning/ProvisionTenantInviteAdminUser.js";

// Use-Cases
import { CreateTenant } from "../application/tenants/CreateTenant.js";
import { GetTenantById } from "../application/tenants/GetTenantById.js";
import { CreateRole } from "../application/roles/CreateRole.js";
import { CreateUser } from "../application/users/CreateUser.js";
import { AssignRoleToUser } from "../application/userRoles/AssignRoleToUser.js";
import { InviteUser } from "../application/users/InviteUser.js";
import { AcceptInvite } from "../application/users/AcceptInvite.js";
import { RequestPasswordReset } from "../application/users/RequestPasswordReset.js";
import { AuthenticateUser } from "../application/auth/AuthenticateUser.js";
import { AuthorizeAction } from "../application/authz/AuthorizeAction.js";
import { RolePolicy } from "../domain/authz/RolePolicy.js";
import { permissionsByRole } from "../domain/authz/permissionsByRole.js";
import { GetAppHealth } from "../application/system/GetAppHealth.js";
import { GetDbHealth } from "../application/system/GetDbHealth.js";
import { GetSessionHealth } from "../application/system/GetSessionHealth.js";
import { GetSystemHealth } from "../application/system/GetSystemHealth.js";
import { GetUsers } from "../application/users/GetUsers.js";
import { GetRoles } from "../application/roles/GetRoles.js";
import { GetTenants } from "../application/tenants/GetTenants.js";

/**
 * @typedef {Object} Repositories
 * @property {import("../infrastructure/persistence/prisma/repositories/TenantRepositoryPrisma.js").TenantRepositoryPrisma} tenantRepository
 * @property {import("../infrastructure/persistence/prisma/repositories/RoleRepositoryPrisma.js").RoleRepositoryPrisma} roleRepository
 * @property {import("../infrastructure/persistence/prisma/repositories/UserRepositoryPrisma.js").UserRepositoryPrisma} userRepository
 * @property {import("../infrastructure/persistence/prisma/repositories/UserRoleRepositoryPrisma.js").UserRoleRepositoryPrisma} userRoleRepository
 */

/**
 * @typedef {Object} Services
 * @property {import("../infrastructure/services/session/SessionServiceRedis.js").SessionServiceRedis} sessionService
 * @property {import("../infrastructure/services/clock/SystemClock.js").SystemClock} clockService
 * @property {import("../infrastructure/services/security/TokenServiceCrypto.js").TokenServiceCrypto} tokenService
 * @property {import("../infrastructure/services/security/PasswordHasherBcrypt.js").PasswordHasherBcrypt} passwordService
 * @property {import("../infrastructure/services/email/EmailServiceMock.js").EmailServiceMock | import("../infrastructure/services/email/EmailServiceMicrosoftGraph.js").EmailServiceMicrosoftGraph} emailService
 * @property {import("../infrastructure/services/url/TenantLinkBuilderService.js").TenantLinkBuilderService} tenantLinkBuilderService
 * @property {import("../infrastructure/services/db/DbHealthServicePrisma.js").DbHealthServicePrisma} dbHealthService
 * @property {import("../infrastructure/services/session/SessionHealthServiceRedis.js").SessionHealthServiceRedis} sessionHealthService
 */

/**
 * @typedef {Object} UseCases
 * @property {import("../application/auth/AuthenticateUser.js").AuthenticateUser} authenticateUser
 * @property {import("../application/authz/AuthorizeAction.js").AuthorizeAction} authorizeAction
 * @property {import("../application/tenants/CreateTenant.js").CreateTenant} createTenant
 * @property {import("../application/tenants/GetTenantById.js").GetTenantById} getTenantById
 * @property {import("../application/roles/CreateRole.js").CreateRole} createRole
 * @property {import("../application/users/CreateUser.js").CreateUser} createUser
 * @property {import("../application/userRoles/AssignRoleToUser.js").AssignRoleToUser} assignRoleToUser
 * @property {import("../application/users/InviteUser.js").InviteUser} inviteUser
 * @property {import("../application/users/AcceptInvite.js").AcceptInvite} acceptInvite
 * @property {import("../application/users/RequestPasswordReset.js").RequestPasswordReset} requestPasswordReset
 * @property {import("../application/system/GetAppHealth.js").GetAppHealth} getAppHealth
 * @property {import("../application/system/GetDbHealth.js").GetDbHealth} getDbHealth
 * @property {import("../application/system/GetSessionHealth.js").GetSessionHealth} getSessionHealth
 * @property {import("../application/system/GetSystemHealth.js").GetSystemHealth} getSystemHealth
 * @property {import("../application/users/GetUsers.js").GetUsers} getUsers
 * @property {import("../application/roles/GetRoles.js").GetRoles} getRoles
 * @property {import("../application/tenants/GetTenants.js").GetTenants} getTenants
 */

/**
 * @typedef {Object} Provisioning
 * @property {import("../application/provisioning/ProvisionTenant.js").ProvisionTenant} provisionTenant
 * @property {import("../application/provisioning/ProvisionTenantRoles.js").ProvisionTenantRoles} provisionTenantRoles
 * @property {import("../application/provisioning/ProvisionTenantAdminUser.js").ProvisionTenantAdminUser} provisionTenantAdminUser
 * @property {import("../application/provisioning/ProvisionTenantAdminUserRole.js").ProvisionTenantAdminUserRole} provisionTenantAdminUserRole
 * @property {import("../application/provisioning/ProvisionTenantInviteAdminUser.js").ProvisionTenantInviteAdminUser} provisionTenantInviteAdminUser
 */

/**
 * @typedef {Object} Container
 * @property {import("./config/appConfig.js").AppConfig} appConfig
 * @property {import("@prisma/client").PrismaClient} prisma
 * @property {Repositories} repositories
 * @property {Services} services
 * @property {UseCases} useCases
 * @property {Provisioning} provisioning
 * @property {() => Promise<void>} shutdown
 */

/**
 * @param {{appConfig: import("./config/appConfig.js").AppConfig}} params
 * @returns {Container}
 */
export function buildContainer({ appConfig }) {
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

  const tenantLinkBuilderService = new TenantLinkBuilderService({
    config: appConfig.frontend,
  });

  const dbHealthService = new DbHealthServicePrisma({ prismaClient: prisma });
  const sessionHealthService = new SessionHealthServiceRedis({
    redisClient: redisClient.client,
  });

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
    tenantLinkBuilderService,
    dbHealthService,
    sessionHealthService,
  };

  // --- Provisioning ---
  const provisionTenant = new ProvisionTenant({
    tenantRepository,
  });

  const provisionTenantRoles = new ProvisionTenantRoles({
    tenantRepository,
    roleRepository,
  });

  const provisionTenantAdminUser = new ProvisionTenantAdminUser({
    tenantRepository,
    userRepository,
  });

  const provisionTenantAdminUserRole = new ProvisionTenantAdminUserRole({
    tenantRepository,
    roleRepository,
    userRepository,
    userRoleRepository,
  });

  const provisionTenantInviteAdminUser = new ProvisionTenantInviteAdminUser({
    tenantRepository,
    userRepository,
    tokenService,
    clockService,
    emailService,
    tenantLinkBuilderService,
  });

  const provisioning = {
    provisionTenant,
    provisionTenantRoles,
    provisionTenantAdminUser,
    provisionTenantAdminUserRole,
    provisionTenantInviteAdminUser,
  };

  // --- Use cases ---
  const policy = new RolePolicy({ permissionsByRole });

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
    tenantLinkBuilderService,
    authorizeAction,
    config: appConfig.auth,
  });
  const acceptInvite = new AcceptInvite({
    userRepository,
    tokenService,
    clockService,
    passwordService,
  });
  const requestPasswordReset = new RequestPasswordReset({
    tenantRepository,
    userRepository,
    userRoleRepository,
    tokenService,
    emailService,
    clockService,
    tenantLinkBuilderService,
    config: appConfig.auth,
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
  const getUsers = new GetUsers({
    userRepository,
    authorizeAction,
  });
  const getRoles = new GetRoles({
    roleRepository,
    authorizeAction,
  });
  const getTenants = new GetTenants({
    tenantRepository,
    authorizeAction,
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
    requestPasswordReset,
    getAppHealth,
    getDbHealth,
    getSessionHealth,
    getSystemHealth,
    getUsers,
    getRoles,
    getTenants,
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
