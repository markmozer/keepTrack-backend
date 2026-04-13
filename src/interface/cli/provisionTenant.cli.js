/**
 * File: src/interface/cli/provisionBaseTenant.cli.js
 */
import { getEnv } from "../../app/config/env.js";
import { loadAppConfig } from "../../app/config/appConfig.js";
import { buildContainer } from "../../app/buildContainer.js";
import { createProvisioningPrincipal } from "../../application/auth/createProvisioningPrincipal.js";
import { getTenantAdminRole } from "../../domain/authz/getSystemRoles.js";

function getArgValue(args, name) {
  const prefix = `--${name}=`;
  const arg = args.find((item) => item.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : undefined;
}

function requireArg(value, name) {
  if (!value || typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing required argument: --${name}=...`);
  }
  return value.trim();
}

function printHelp() {
  console.log(`
Usage:
  npm run provision:base-tenant -- --name="..." --slug="..." --type="..."

Arguments:
  --name=...         Tenant name
  --slug=...         Tenant slug
  --type=...         Tenant type { "BASE" | "CLIENT" | "DEMO" }
  --adminEmail=...   Email address of the first ADMIN user
`);
}

/**
 * @param {string} value
 * @returns {NodeEnv}
 */
function parseNodeEnv(value) {
  if (value === "test" || value === "production") {
    return value;
  }
  return "development";
}

async function main() {
  const nodeEnv = parseNodeEnv(getEnv("NODE_ENV", "development"));

  if (nodeEnv !== "production") {
    try {
      await import("dotenv/config");
    } catch (e) {
      // dotenv niet geïnstalleerd → negeren
    }
  }
  let shutdown;

  try {
    const args = process.argv.slice(2);

    if (args.includes("--help")) {
      printHelp();
      process.exit(0);
    }

    const name = requireArg(getArgValue(args, "name"), "name");
    const slug = requireArg(getArgValue(args, "slug"), "slug");
    const type = requireArg(getArgValue(args, "type"), "type");
    const adminEmail = requireArg(
      getArgValue(args, "adminEmail"),
      "adminEmail",
    );

    const appConfig = loadAppConfig();
    const container = buildContainer({ appConfig });
    shutdown = container.shutdown;

    const principal = createProvisioningPrincipal();
    const now = container.services.clockService.now();

    const tenantResult = await container.provisioning.provisionTenant.execute({
      principal,
      payload: {
        name,
        slug,
        type,
        now,
      },
    });

    if (!tenantResult.success) {
      console.log(tenantResult);
      throw new Error(tenantResult.error.message);
    }

    const tenant = tenantResult.payload;

    const rolesResult =
      await container.provisioning.provisionTenantRoles.execute({
        principal,
        payload: {
          tenantId: tenant.id,
          now,
        },
      });

    if (!rolesResult.success) {
      console.log(rolesResult);
      throw new Error(rolesResult.error.message);
    }

    const roles = rolesResult.payload.map((r) => r.role);

    const userResult =
      await container.provisioning.provisionTenantAdminUser.execute({
        principal,
        payload: {
          tenantId: tenant.id,
          email: adminEmail,
          now,
        },
      });

    if (!userResult.success) {
      console.log(userResult);
      throw new Error(userResult.error.message);
    }

    const user = userResult.payload;

    const adminRolename = getTenantAdminRole(tenantResult.payload.type);

    const userRoleResult =
      await container.provisioning.provisionTenantAdminUserRole.execute({
        principal,
        payload: {
          tenantId: tenant.id,
          userId: user.id,
          roleName: adminRolename,
          now,
        },
      });

    if (!userRoleResult.success) {
      console.log(userRoleResult);
      throw new Error(userRoleResult.error.message);
    }

    const userRole = userRoleResult.payload;

    const inviteAdminUserResult =
      await container.provisioning.provisionTenantInviteAdminUser.execute({
        principal,
        payload: {
          tenantId: tenant.id,
          userId: user.id,
          now,
        },
      });

    if (!inviteAdminUserResult.success) {
      console.log(inviteAdminUserResult);
      throw new Error(inviteAdminUserResult.error.message);
    }

    const result = {
      tenantResult: {
        created: tenantResult.created,
        tenant: tenantResult.payload,
      },
      rolesResult: rolesResult.payload,
      userResult: {
        created: userResult.created,
        user: userResult.payload,
      },
      userRoleResult: {
        created: userRoleResult.created,
        userRole: userRoleResult.payload,
      },
      inviteAdminUserResult: {
        invited: inviteAdminUserResult.invited,
        updatedUser: inviteAdminUserResult.payload,
        token: inviteAdminUserResult.token,
      },
    };

    console.log("✅ ProvisionTenant completed successfully.");
    console.log(JSON.stringify(result, null, 2));

    if (typeof shutdown === "function") {
      await shutdown();
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ ProvisionTenant failed.");

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }

    if (typeof shutdown === "function") {
      try {
        await shutdown();
      } catch (shutdownError) {
        console.error("Shutdown failed:", shutdownError);
      }
    }

    process.exit(1);
  }
}

main();
