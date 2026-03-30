/**
 * File: src/tests/integration/tenants/createTenant.int.test.js
 */

import { loadAppConfig } from "../../../app/config/appConfig.js";
import { createApp } from "../../../app/createApp.js";

import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";
import { resetDatabase } from "../../helpers/resetDatabase.js";
import { setupBaseTenantWithSuperAdmin } from "../../helpers/fixtures/setupBaseTenantWithSuperAdmin.js";

describe("CreateTenant (integration) POST /api/tenants", () => {
  let appConfig;
  let container;
  let app;
  let tenant;
  let superAdminUser;
  let api;

  beforeAll(async () => {
    appConfig = loadAppConfig();
    ({ app, container } = await createApp({ appConfig }));
  });

  beforeEach(async () => {
    await resetDatabase({ prisma: container.prisma });

    ({ tenant, superAdminUser, api } =
      await setupBaseTenantWithSuperAdmin({
        app,
        prisma: container.prisma,
        container,
      }));
  });

  afterAll(async () => {
    if (container) {
      await container.shutdown();
    }
  });

  it("creates a tenant", async () => {
    const name = "Mozer Consulting";
    const slug = "mozer-consulting";
    const type = "CLIENT";

    const response = await api.post("/api/tenants").send({
      name,
      slug,
      type,
    });

    expect(response.status).toBe(201);

    expect(response.body).toEqual({
      success: true,
      payload: {
        id: expect.any(String),
        name,
        slug,
        status: "ACTIVE",
        type,
      },
      error: null,
    });

    const row = await container.prisma.tenant.findUnique({
      where: { slug },
    });

    expect(row).toBeTruthy();
    expect(row?.name).toBe(name);
    expect(row?.slug).toBe(slug);
    expect(row?.status).toBe("ACTIVE");
    expect(row?.type).toBe(type);
  });
  it("supports multiple tenants of type CLIENT", async () => {
    const tenant1 = {
      name: "Mozer Consulting", 
      slug: "mozer-consulting", 
      type: "CLIENT"
    };

    const tenant2 = {
      name: "Acme Ltd.", 
      slug: "acme", 
      type: "CLIENT"
    };

    await api.post("/api/tenants").send({
      name: tenant1.name,
      slug: tenant1.slug,
      type: tenant1.type,
    });

    const response = await api.post("/api/tenants").send({
      name: tenant2.name,
      slug: tenant2.slug,
      type: tenant2.type,
    })

    expect(response.status).toBe(201);

    expect(response.body).toEqual({
      success: true,
      payload: {
        id: expect.any(String),
        name: tenant2.name,
        slug: tenant2.slug,
        status: "ACTIVE",
        type: tenant2.type,
      },
      error: null,
    });

    const row = await container.prisma.tenant.findUnique({
      where: { slug: tenant2.slug },
    });

    expect(row).toBeTruthy();
    expect(row?.name).toBe(tenant2.name);
    expect(row?.slug).toBe(tenant2.slug);
    expect(row?.status).toBe("ACTIVE");
    expect(row?.type).toBe(tenant2.type);
  });
  it("returns 409 when slug already exists", async () => {
    const tenant1 = {
      name: "Mozer Consulting", 
      slug: "mozer-consulting", 
      type: "CLIENT"
    };

    const tenant2 = {
      name: "Another Name", 
      slug: tenant1.slug, 
      type: "CLIENT"
    };
    

    await api.post("/api/tenants").send({
      name: tenant1.name,
      slug: tenant1.slug,
      type: tenant1.type,
    });

    const response = await api.post("/api/tenants").send({
      name: tenant2.name,
      slug: tenant2.slug,
      type: tenant2.type,
    });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
  });

  it("returns 422 when slug is invalid", async () => {
    const name = "Mozer Consulting";
    const slug = "mozer consulting";
    const type = "CLIENT";
    const response = await api.post("/api/tenants").send({
      name,
      slug,
      type,
    });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
  });
  it("returns 409 when a second BASE tenant is created", async () => {
    const name = "KeepTrack Online";
    const slug = "second-base";
    const type = "BASE";
    const response = await api.post("/api/tenants").send({
      name,
      slug,
      type,
    });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
  });
});
