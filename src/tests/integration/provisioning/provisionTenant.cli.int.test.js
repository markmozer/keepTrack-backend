/**
 * File: src/tests/integration/provisioning/provisionTenant.cli.int.test.js
 */

import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import { promisify } from "node:util";
import { execFile as execFileCb } from "node:child_process";
import path from "node:path";

import { createTestApp } from "../../helpers/bootstrap/createTestApp.js";
import { resetDatabase } from "../../helpers/db/resetDatabase.js";

const execFile = promisify(execFileCb);

describe("ProvisionTenant CLI (integration)", () => {
  let container;

  beforeAll(async () => {
    ({ container } = await createTestApp());
  });

  beforeEach(async () => {
    await resetDatabase({ prisma: container.prisma });
  });

  afterAll(async () => {
    if (container) {
      await container.shutdown();
    }
  });

  function getCliPath() {
    return path.resolve(
      process.cwd(),
      "src/interface/cli/provisionTenant.cli.js",
    );
  }

  async function runProvisionTenantCli({
    name,
    slug,
    type,
    adminEmail,
  }) {
    const cliPath = getCliPath();

    return execFile(
      process.execPath,
      [
        cliPath,
        `--name=${name}`,
        `--slug=${slug}`,
        `--type=${type}`,
        `--adminEmail=${adminEmail}`,
      ],
      {
        env: {
          ...process.env,
          NODE_ENV: "test",
        },
      },
    );
  }

  it("provisions tenant, roles, admin user, admin user role and invite", async () => {
    const tenantName = "Client Tenant";
    const tenantSlug = "client-tenant";
    const tenantType = "CLIENT";
    const adminEmail = "admin@client-tenant.nl";

    const { stdout, stderr } = await runProvisionTenantCli({
      name: tenantName,
      slug: tenantSlug,
      type: tenantType,
      adminEmail,
    });

    expect(stderr).toBe("");
    expect(stdout).toContain("✅ ProvisionTenant completed successfully.");

    const tenant = await container.prisma.tenant.findUnique({
      where: {
        slug: tenantSlug,
      },
    });

    expect(tenant).toBeTruthy();
    expect(tenant?.name).toBe(tenantName);
    expect(tenant?.slug).toBe(tenantSlug);
    expect(tenant?.type).toBe(tenantType);
    expect(tenant?.status).toBe("ACTIVE");

    const roles = await container.prisma.role.findMany({
      where: {
        tenantId: tenant.id,
      },
      orderBy: {
        name: "asc",
      },
    });

    expect(roles.length).toBeGreaterThan(0);

    const user = await container.prisma.user.findUnique({
      where: {
        tenantId_email: {
          tenantId: tenant.id,
          email: adminEmail,
        },
      },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    expect(user).toBeTruthy();
    expect(user?.tenantId).toBe(tenant.id);
    expect(user?.email).toBe(adminEmail);
    expect(user?.status).toBe("INVITED");
    expect(typeof user?.inviteTokenHash).toBe("string");
    expect(user?.inviteTokenHash.length).toBeGreaterThan(10);
    expect(user?.inviteTokenExpiresAt).toBeInstanceOf(Date);

    const roleNames = user?.userRoles.map((ur) => ur.role.name) ?? [];
    expect(roleNames.length).toBe(1);

    if (tenantType === "BASE") {
      expect(roleNames).toContain("SUPER_ADMIN");
    } else if (tenantType === "CLIENT") {
      expect(roleNames).toContain("ADMIN");
    } else if (tenantType === "DEMO") {
      expect(roleNames).toContain("ADMIN");
    }
  });

  it("is idempotent when tenant already exists with matching details", async () => {
    const tenantName = "Client Tenant";
    const tenantSlug = "client-tenant";
    const tenantType = "CLIENT";
    const adminEmail = "admin@client-tenant.nl";

    await runProvisionTenantCli({
      name: tenantName,
      slug: tenantSlug,
      type: tenantType,
      adminEmail,
    });

    const firstTenant = await container.prisma.tenant.findUnique({
      where: {
        slug: tenantSlug,
      },
    });

    const firstUser = await container.prisma.user.findUnique({
      where: {
        tenantId_email: {
          tenantId: firstTenant.id,
          email: adminEmail,
        },
      },
    });

    const firstRoles = await container.prisma.role.findMany({
      where: {
        tenantId: firstTenant.id,
      },
    });

    const { stdout, stderr } = await runProvisionTenantCli({
      name: tenantName,
      slug: tenantSlug,
      type: tenantType,
      adminEmail,
    });

    expect(stderr).toBe("");
    expect(stdout).toContain("✅ ProvisionTenant completed successfully.");

    const tenants = await container.prisma.tenant.findMany({
      where: {
        slug: tenantSlug,
      },
    });

    expect(tenants).toHaveLength(1);

    const users = await container.prisma.user.findMany({
      where: {
        tenantId: firstTenant.id,
        email: adminEmail,
      },
    });

    expect(users).toHaveLength(1);

    const roles = await container.prisma.role.findMany({
      where: {
        tenantId: firstTenant.id,
      },
    });

    expect(roles).toHaveLength(firstRoles.length);

    const secondUser = await container.prisma.user.findUnique({
      where: {
        tenantId_email: {
          tenantId: firstTenant.id,
          email: adminEmail,
        },
      },
    });

    expect(secondUser?.id).toBe(firstUser?.id);
  });

  it("fails when singleton tenant type already exists with different details", async () => {
    await container.prisma.tenant.create({
      data: {
        name: "Existing Base Tenant",
        slug: "existing-base",
        type: "BASE",
        status: "ACTIVE",
      },
    });

    const cliPath = getCliPath();

    let error;

    try {
      await execFile(
        process.execPath,
        [
          cliPath,
          "--name=Another Base Tenant",
          "--slug=another-base",
          "--type=BASE",
          "--adminEmail=admin@another-base.nl",
        ],
        {
          env: {
            ...process.env,
            NODE_ENV: "test",
          },
        },
      );
    } catch (err) {
      error = err;
    }

    expect(error).toBeTruthy();
    expect(error.code).toBe(1);
    expect(error.stderr).toContain("❌ ProvisionTenant failed.");

    const baseTenants = await container.prisma.tenant.findMany({
      where: {
        type: "BASE",
      },
    });

    expect(baseTenants).toHaveLength(1);
    expect(baseTenants[0].slug).toBe("existing-base");
  });
});