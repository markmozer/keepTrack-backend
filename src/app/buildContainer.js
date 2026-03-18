/**
 * File: src/app/buildContainer.js
 */

import { getPrisma } from "../infrastructure/persistence/prisma/prismaClient.js";
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

import { CreateTenant } from "../application/tenants/CreateTenant.js";
import { GetTenantById } from "../application/tenants/GetTenantById.js";
import { CreateRole } from "../application/roles/CreateRole.js";
import { CreateUser } from "../application/users/CreateUser.js";
import { AssignRoleToUser } from "../application/userRoles/AssignRoleToUser.js";
import { InviteUser } from "../application/users/InviteUser.js";
import { AcceptInvite } from "../application/users/AcceptInvite.js";
import { AuthenticateUser } from "../application/auth/AuthenticateUser.js";

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
  // --- Infrastructure ---
  const prisma = getPrisma();
  const redisClient = new RedisClient();
  const sessionStore = new SessionStoreRedis(
    { redisClient: redisClient.client },
    {
      prefix:
        requireEnv(process.env.SESSION_KEY_PREFIX, "SESSION_KEY_PREFIX") ??
        "sess:",
    },
  );

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

  // --- Services ---

  const ttlSeconds = Number(process.env.SESSION_TTL_SECONDS ?? 60 * 60 * 24); // 24h
  const sessionService = new SessionServiceRedis(
    { sessionStore },
    { ttlSeconds },
  );

  const clockService = new SystemClock();
  const tokenService = new TokenServiceCrypto();
  const passwordService = new PasswordHasherBcrypt();

  let emailService;
  if (requireEnv(process.env.EMAIL_PROVIDER, "EMAIL_PROVIDER") === "mock") {
    emailService = new EmailServiceMock();
  } else {
    emailService = new EmailServiceMicrosoftGraph({
      tenantId: requireEnv(process.env.MSAL_TENANT_ID, "MSAL_TENANT_ID"),
      clientId: requireEnv(process.env.MSAL_CLIENT_ID, "MSAL_CLIENT_ID"),
      clientSecret: requireEnv(
        process.env.MSAL_CLIENT_SECRET,
        "MSAL_CLIENT_SECRET",
      ),
      fromEmail: requireEnv(
        process.env.USER_PRINCIPAL_NAME,
        "USER_PRINCIPAL_NAME",
      ),
    });
  }

  const services = {
    sessionService,
    clockService,
    tokenService,
    passwordService,
    emailService,
  };

  // --- Use cases ---
  const appBaseUrl = requireEnv(process.env.APP_BASE_URL, "APP_BASE_URL");
  const inviteTtlDays = 14;

  const useCases = {
    createTenant: new CreateTenant({ tenantRepository }),
    getTenantById: new GetTenantById({ tenantRepository }),
    createRole: new CreateRole({ tenantRepository, roleRepository }),
    createUser: new CreateUser({ tenantRepository, userRepository }),
    assignRoleToUser: new AssignRoleToUser({
      tenantRepository,
      userRepository,
      roleRepository,
      userRoleRepository,
    }),
    inviteUser: new InviteUser({
      tenantRepository,
      userRepository,
      userRoleRepository,
      tokenService,
      emailService,
      clockService,
      config: { inviteTtlDays, appBaseUrl },
    }),
    acceptInvite: new AcceptInvite({
      userRepository,
      tokenService,
      clockService,
      passwordService,
    }),
    authenticateUser: new AuthenticateUser({
      userRepository,
      userRoleRepository,
      passwordService,
      sessionService,
      clockService,
    })
  };

  // --- Other ---
  async function shutdown() {
    await prisma.$disconnect();
  }

  return {
    repositories,
    services,
    useCases,
    shutdown,
  };
}
