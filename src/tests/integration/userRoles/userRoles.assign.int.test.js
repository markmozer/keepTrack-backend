/**
 * File: src/tests/integration/userRoles/userRoles.assign.int.test.js
 */

import { randomUUID } from "node:crypto";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { createApp } from "../../../app/createApp.js";
import { getPrisma } from "../../../infrastructure/persistence/prisma/prismaClient.js";

describe("POST /api/users/:userId/roles", () => {
  const prisma = getPrisma();
  const { app } = createApp();

  beforeEach(async () => {
    await prisma.userRole.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    await prisma.tenant.deleteMany();
  });

  it("assigns a role to a user and returns 201 when created", async () => {
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
        email: "mark.mozer@example.com",
        status: "NEW",
      },
    });

    const role = await prisma.role.create({
      data: {
        tenantId: tenant.id,
        name: "ADMIN",
      },
    });

    const response = await request(app)
      .post(`/api/users/${user.id}/roles`)
      .send({
        tenantId: tenant.id,
        roleId: role.id,
        validFrom: null,
        validTo: null,
      });

    expect(response.status).toBe(201);

    expect(response.body).toEqual({
      success: true,
      payload: {
        id: expect.any(String),
        tenantId: tenant.id,
        userId: user.id,
        roleId: role.id,
        validFrom: expect.any(String),
        validTo: null,
      },
      error: null,
    });

    const row = await prisma.userRole.findUnique({
      where: {
        tenantId_userId_roleId: {
          tenantId: tenant.id,
          userId: user.id,
          roleId: role.id,
        },
      },
    });

    expect(row).toBeTruthy();
    expect(row?.tenantId).toBe(tenant.id);
    expect(row?.userId).toBe(user.id);
    expect(row?.roleId).toBe(role.id);
    expect(row?.validTo).toBeNull();
  });

  it("returns 200 and the existing assignment when role is already assigned to user", async () => {
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
        email: "mark.mozer@example.com",
        status: "NEW",
      },
    });

    const role = await prisma.role.create({
      data: {
        tenantId: tenant.id,
        name: "ADMIN",
      },
    });

    const existing = await prisma.userRole.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        roleId: role.id,
        validFrom: new Date("2026-03-12T21:00:00.000Z"),
        validTo: null,
      },
    });

    const response = await request(app)
      .post(`/api/users/${user.id}/roles`)
      .send({
        tenantId: tenant.id,
        roleId: role.id,
        validFrom: null,
        validTo: null,
      });

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      success: true,
      payload: {
        id: existing.id,
        tenantId: tenant.id,
        userId: user.id,
        roleId: role.id,
        validFrom: existing.validFrom.toISOString(),
        validTo: null,
      },
      error: null,
    });

    const count = await prisma.userRole.count({
      where: {
        tenantId: tenant.id,
        userId: user.id,
        roleId: role.id,
      },
    });

    expect(count).toBe(1);
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
        email: "mark.mozer@example.com",
        status: "NEW",
      },
    });

    const role = await prisma.role.create({
      data: {
        tenantId: tenant.id,
        name: "ADMIN",
      },
    });

    const response = await request(app)
      .post(`/api/users/${user.id}/roles`)
      .send({
        tenantId: randomUUID(),
        roleId: role.id,
        validFrom: null,
        validTo: null,
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

    const role = await prisma.role.create({
      data: {
        tenantId: tenant.id,
        name: "ADMIN",
      },
    });

    const response = await request(app)
      .post(`/api/users/${randomUUID()}/roles`)
      .send({
        tenantId: tenant.id,
        roleId: role.id,
        validFrom: null,
        validTo: null,
      });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.payload).toBeNull();
    expect(response.body.error).toBeTruthy();
  });

  it("returns 404 when role does not exist", async () => {
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
        email: "mark.mozer@example.com",
        status: "NEW",
      },
    });

    const response = await request(app)
      .post(`/api/users/${user.id}/roles`)
      .send({
        tenantId: tenant.id,
        roleId: randomUUID(),
        validFrom: null,
        validTo: null,
      });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.payload).toBeNull();
    expect(response.body.error).toBeTruthy();
  });

  it("returns 422 when validTo is before validFrom", async () => {
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
        email: "mark.mozer@example.com",
        status: "NEW",
      },
    });

    const role = await prisma.role.create({
      data: {
        tenantId: tenant.id,
        name: "ADMIN",
      },
    });

    const response = await request(app)
      .post(`/api/users/${user.id}/roles`)
      .send({
        tenantId: tenant.id,
        roleId: role.id,
        validFrom: "2026-03-12T22:00:00.000Z",
        validTo: "2026-03-12T21:00:00.000Z",
      });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.payload).toBeNull();
    expect(response.body.error).toBeTruthy();
  });
});