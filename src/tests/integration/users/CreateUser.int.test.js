/**
 * File: src/application/users/__tests__/CreateUser.int.test.js
 */

import request from "supertest";
import { describe, it, expect, beforeEach, afterAll } from "vitest";

import { createApp } from "../../../app/createApp.js";
import { Role } from "../../../domain/authz/authz.types.js";

// Pas deze imports aan naar jouw echte test helpers / seed helpers
import { resetDatabase } from "../../../tests/helpers/resetDatabase.js";
import { seedTenant } from "../../../tests/helpers/seedTenant.js";
import { seedUser } from "../../../tests/helpers/seedUser.js";
import { seedRole } from "../../../tests/helpers/seedRole.js";
import { loginAs } from "../../../tests/helpers/loginAs.js";

describe("CreateUser (integration)", () => {
  let app;
  let shutdown;

  /** @type {{ id: string, slug: string, name: string }} */
  let tenant;

  /** @type {{ id: string, email: string }} */
  let adminUser;

  /** @type {{ id: string, email: string }} */
  let userAdminUser;

  /** @type {{ id: string, email: string }} */
  let userViewerUser;

  beforeEach(async () => {
    await resetDatabase();

     ({ app, shutdown } = createApp());
    shutdown = app.shutdown;

    tenant = await seedTenant({
      slug: "mozer-consulting",
      name: "Mozer Consulting",
    });

    const adminRole = await seedRole({
        tenantId: tenant.id,
        name: "ADMIN",
    });

    const user_adminRole = await seedRole({
        tenantId: tenant.id,
        name: "USER_ADMIN",
    });

     const user_viewerRole = await seedRole({
        tenantId: tenant.id,
        name: "USER_VIEWER",
    });

    adminUser = await seedUser({
      tenantId: tenant.id,
      email: "admin@example.com",
      roleNames: ["ADMIN"],
      status: "ACTIVE",
      passwordPlain: "Test123!123",
    });

    userAdminUser = await seedUser({
      tenantId: tenant.id,
      email: "useradmin@example.com",
      roleNames: ["USER_ADMIN"],
      status: "ACTIVE",
      passwordPlain: "Test123!123",
    });

    userViewerUser = await seedUser({
      tenantId: tenant.id,
      email: "userviewer@example.com",
      roleNames: ["USER_VIEWER"],
      status: "ACTIVE",
      passwordPlain: "Test123!123",
    });
  });

  afterAll(async () => {
    if (shutdown) {
      await shutdown();
    }
  });

  it("returns 401 when principal is missing", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({
        email: "new.user@example.com",
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("returns 403 when principal has USER_VIEWER role", async () => {
    const agent = await loginAs(app, {
      tenantSlug: tenant.slug,
      email: userViewerUser.email,
    });

    const res = await agent.post("/api/users").send({
      email: "new.user@example.com",
    });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("FORBIDDEN");
    expect(res.body.error.message).toBe("Action not allowed");
    expect(res.body.error.details).toEqual({
      action: "create",
      resource: "user",
      context: {
        useCase: "CreateUser",
      },
    });
  });

  it("returns 201 when principal has USER_ADMIN role", async () => {
    const agent = await loginAs(app, {
      tenantSlug: tenant.slug,
      email: userAdminUser.email,
    });

    const res = await agent.post("/api/users").send({
      email: "created.by.useradmin@example.com",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.payload).toBeTruthy();

    expect(res.body.payload.email).toBe("created.by.useradmin@example.com");

    // pas aan aan jouw echte DTO
    expect(res.body.payload.id).toBeTruthy();
  });

  it("returns 201 when principal has ADMIN role", async () => {
    const agent = await loginAs(app, {
      tenantSlug: tenant.slug,
      email: adminUser.email,
    });

    const res = await agent.post("/api/users").send({
      email: "created.by.admin@example.com",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.payload).toBeTruthy();
    expect(res.body.payload.email).toBe("created.by.admin@example.com");

    // pas aan aan jouw echte DTO
    expect(res.body.payload.id).toBeTruthy();
  });
});