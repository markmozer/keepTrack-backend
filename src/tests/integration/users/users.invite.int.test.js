/**
 * File: src/tests/integration/users/users.invite.int.test.js
 */

import { randomUUID } from "node:crypto";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { createApp } from "../../../app/createApp.js";
import { getPrisma } from "../../../infrastructure/persistence/prisma/prismaClient.js";

describe("POST /api/users/:userId/invite", () => {
  const prisma = getPrisma();
  const { app } = createApp();

  beforeEach(async () => {
    await prisma.userRole.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    await prisma.tenant.deleteMany();
  });

  it("invites a user and returns 200", async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: "Mozer Consulting",
        slug: "mozer-consulting",
        status: "ACTIVE",
      },
    });

    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: "mark@mozer-consulting.com",
        status: "NEW",
      },
    });

    const role = await prisma.role.create({
      data: {
        tenantId: tenant.id,
        name: "ADMIN",
      },
    });

    await prisma.userRole.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        roleId: role.id,
        validFrom: new Date("2026-03-10T10:00:00.000Z"),
        validTo: null,
      },
    });

    const response = await request(app)
      .post(`/api/users/${user.id}/invite`)
      .send({
        tenantId: tenant.id,
      });

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      success: true,
      payload: {
        id: user.id,
        tenantId: tenant.id,
        email: "mark@mozer-consulting.com",
        inviteTokenExpiresAt: expect.any(String),
        status: "INVITED",
      },
      error: null,
    });

    const updated = await prisma.user.findUnique({
      where: { id: user.id },
    });

    expect(updated).toBeTruthy();
    expect(updated?.status).toBe("INVITED");
    expect(updated?.inviteTokenExpiresAt).toBeTruthy();
    expect(updated?.inviteTokenHash).toBeTruthy();
  });

  it("returns 404 when tenant does not exist", async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: "Mozer Consulting",
        slug: "mozer-consulting",
        status: "ACTIVE",
      },
    });

    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: "mark@mozer-consulting.com",
        status: "NEW",
      },
    });

    const response = await request(app)
      .post(`/api/users/${user.id}/invite`)
      .send({
        tenantId: randomUUID(),
      });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.payload).toBeNull();
    expect(response.body.error).toBeTruthy();
  });

  it("returns 404 when user does not exist", async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: "Mozer Consulting",
        slug: "mozer-consulting",
        status: "ACTIVE",
      },
    });

    const response = await request(app)
      .post(`/api/users/${randomUUID()}/invite`)
      .send({
        tenantId: tenant.id,
      });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.payload).toBeNull();
    expect(response.body.error).toBeTruthy();
  });

  it("returns 422 when user status is not invitable", async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: "Mozer Consulting",
        slug: "mozer-consulting",
        status: "ACTIVE",
      },
    });

    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: "mark@mozer-consulting.com",
        status: "ACTIVE",
      },
    });

    const role = await prisma.role.create({
      data: {
        tenantId: tenant.id,
        name: "ADMIN",
      },
    });

    await prisma.userRole.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        roleId: role.id,
        validFrom: new Date("2026-03-10T10:00:00.000Z"),
        validTo: null,
      },
    });

    const response = await request(app)
      .post(`/api/users/${user.id}/invite`)
      .send({
        tenantId: tenant.id,
      });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.payload).toBeNull();
    expect(response.body.error).toBeTruthy();
  });

  it("returns 422 when user has no roles", async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: "Mozer Consulting",
        slug: "mozer-consulting",
        status: "ACTIVE",
      },
    });

    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: "mark@mozer-consulting.com",
        status: "NEW",
      },
    });

    const response = await request(app)
      .post(`/api/users/${user.id}/invite`)
      .send({
        tenantId: tenant.id,
      });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.payload).toBeNull();
    expect(response.body.error).toBeTruthy();
  });

  it("returns 422 when user has no valid roles now or in the future", async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: "Mozer Consulting",
        slug: "mozer-consulting",
        status: "ACTIVE",
      },
    });

    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: "mark@mozer-consulting.com",
        status: "NEW",
      },
    });

    const role = await prisma.role.create({
      data: {
        tenantId: tenant.id,
        name: "ADMIN",
      },
    });

    await prisma.userRole.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        roleId: role.id,
        validFrom: new Date("2026-03-01T10:00:00.000Z"),
        validTo: new Date("2026-03-05T10:00:00.000Z"),
      },
    });

    const response = await request(app)
      .post(`/api/users/${user.id}/invite`)
      .send({
        tenantId: tenant.id,
      });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.payload).toBeNull();
    expect(response.body.error).toBeTruthy();
  });

  it("allows re-inviting a user with status INVITED", async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: "Mozer Consulting",
        slug: "mozer-consulting",
        status: "ACTIVE",
      },
    });

    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: "mark@mozer-consulting.com",
        status: "INVITED",
        inviteTokenHash: "oldhash",
        inviteTokenExpiresAt: new Date("2026-03-15T10:00:00.000Z"),
      },
    });

    const role = await prisma.role.create({
      data: {
        tenantId: tenant.id,
        name: "ADMIN",
      },
    });

    await prisma.userRole.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        roleId: role.id,
        validFrom: new Date("2026-03-10T10:00:00.000Z"),
        validTo: null,
      },
    });

    const response = await request(app)
      .post(`/api/users/${user.id}/invite`)
      .send({
        tenantId: tenant.id,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.payload.status).toBe("INVITED");
    expect(response.body.payload.inviteTokenExpiresAt).toEqual(expect.any(String));

    const updated = await prisma.user.findUnique({
      where: { id: user.id },
    });

    expect(updated?.inviteTokenHash).toBeTruthy();
    expect(updated?.inviteTokenExpiresAt).toBeTruthy();
  });
});