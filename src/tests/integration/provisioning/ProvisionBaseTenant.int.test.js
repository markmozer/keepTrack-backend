/**
 * File: src/tests/integration/provisioning/ProvisionBaseTenant.int.test.js
 */

import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { buildContainer } from "../../../app/buildContainer.js";
import { createProvisioningPrincipal, createSystemPrincipal } from "../../../application/auth/createProvisioningPrincipal.js";
import {
  ConflictError,
  ValidationError,
} from "../../../domain/shared/errors/index.js";
import { UserStatus } from "../../../domain/users/UserStatus.js";
import { TenantType } from "../../../domain/tenants/TenantType.js";
import { TenantStatus } from "../../../domain/tenants/TenantStatus.js";
import { Role } from "../../../domain/authz/authz.types.js";

describe("ProvisionBaseTenant (integration)", () => {
  let container;
  let shutdown;

  beforeEach(async () => {
    container = buildContainer();
    shutdown = container.shutdown;

    // Kies hier jouw eigen reset helper.
    // Voorbeelden:
    // await resetDatabase(container.prisma);
    // await truncateAllTables(container.prisma);
    // await container.testSupport.resetDatabase();
    const prisma = container.prisma ?? container.db?.prisma;
    if (!prisma) {
      throw new Error(
        "Test setup error: no prisma instance found on container. Add your DB reset helper here."
      );
    }

    await prisma.userRole.deleteMany();
    await prisma.role.deleteMany();
    await prisma.user.deleteMany();
    await prisma.tenant.deleteMany();
  });

  afterAll(async () => {
    if (typeof shutdown === "function") {
      await shutdown();
    }
  });

  async function executeProvisionBaseTenant(overrides = {}) {
    const principal =
      overrides.principal === undefined
        ? createProvisioningPrincipal()
        : overrides.principal;

    const payload = {
      name: "Mozer Consulting",
      slug: "mozer-consulting",
      adminEmail: "mark@mozer-consulting.com",
      ...(overrides.payload ?? {}),
    };

    return container.provisioning.provisionBaseTenant.execute({
      principal,
      payload,
    });
  }

  it("provisions BASE tenant from scratch", async () => {
    const result = await executeProvisionBaseTenant();

    expect(result.tenantAction).toBe("create");
    expect(result.roleAction).toBe("create");
    expect(result.userAction).toBe("create");
    expect(result.userRoleAction).toBe("create");
    expect(result.inviteUserAction).toBe("create");

    expect(result.provisionedTenant).toMatchObject({
      name: "Mozer Consulting",
      slug: "mozer-consulting",
      type: TenantType.BASE,
      status: TenantStatus.ACTIVE,
    });

    expect(result.provisionedRole).toMatchObject({
      tenantId: result.provisionedTenant.id,
      name: Role.SUPER_ADMIN,
    });

    expect(result.provisionedUser).toMatchObject({
      tenantId: result.provisionedTenant.id,
      email: "mark@mozer-consulting.com",
      status: UserStatus.NEW,
    });

    expect(result.provisionedUserRole).toMatchObject({
      tenantId: result.provisionedTenant.id,
      userId: result.provisionedUser.id,
      roleId: result.provisionedRole.id,
    });

    expect(result.invitedUser).toMatchObject({
      tenantId: result.provisionedTenant.id,
      email: "mark@mozer-consulting.com",
      status: UserStatus.INVITED,
    });

    expect(result.invitedUser.inviteTokenExpiresAt).toBeTruthy();
    expect(typeof result.tokenPlaintext).toBe("string");
    expect(result.tokenPlaintext.length).toBeGreaterThan(10);

    const prisma = container.prisma ?? container.db?.prisma;

    const tenants = await prisma.tenant.findMany();
    const roles = await prisma.role.findMany();
    const users = await prisma.user.findMany();
    const userRoles = await prisma.userRole.findMany();

    expect(tenants).toHaveLength(1);
    expect(roles).toHaveLength(1);
    expect(users).toHaveLength(1);
    expect(userRoles).toHaveLength(1);
  });

  it("is resumable when rerun with same input", async () => {
    const first = await executeProvisionBaseTenant();
    const second = await executeProvisionBaseTenant();

    expect(first.tenantAction).toBe("create");
    expect(second.tenantAction).toBe("read");

    expect(first.roleAction).toBe("create");
    expect(second.roleAction).toBe("read");

    expect(first.userAction).toBe("create");
    expect(second.userAction).toBe("read");

    expect(first.userRoleAction).toBe("create");
    expect(second.userRoleAction).toBe("read");

    // invite-beleid in jouw huidige implementatie:
    // bij rerun wordt invite opnieuw uitgegeven / geüpdatet
    expect(["create", "update"]).toContain(second.inviteUserAction);
    expect(second.invitedUser.status).toBe(UserStatus.INVITED);
    expect(typeof second.tokenPlaintext).toBe("string");

    const prisma = container.prisma ?? container.db?.prisma;

    const tenants = await prisma.tenant.findMany();
    const roles = await prisma.role.findMany();
    const users = await prisma.user.findMany();
    const userRoles = await prisma.userRole.findMany();

    expect(tenants).toHaveLength(1);
    expect(roles).toHaveLength(1);
    expect(users).toHaveLength(1);
    expect(userRoles).toHaveLength(1);
  });

  it("throws ConflictError when BASE tenant already exists with different details", async () => {
    await executeProvisionBaseTenant();

    await expect(
      executeProvisionBaseTenant({
        payload: {
          name: "Different Name",
          slug: "different-slug",
          adminEmail: "mark@mozer-consulting.com",
        },
      })
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("throws ConflictError when base admin user already exists and is ACTIVE", async () => {
    const first = await executeProvisionBaseTenant();

    const prisma = container.prisma ?? container.db?.prisma;

    await prisma.user.update({
      where: { id: first.invitedUser.id },
      data: {
        status: UserStatus.ACTIVE,
        inviteTokenHash: null,
        inviteTokenExpiresAt: null,
      },
    });

    await expect(executeProvisionBaseTenant()).rejects.toBeInstanceOf(
      ConflictError
    );
  });

  it("throws ValidationError when provisioning principal is invalid", async () => {
    await expect(
      executeProvisionBaseTenant({
        principal: null,
      })
    ).rejects.toBeInstanceOf(ValidationError);
  });
});