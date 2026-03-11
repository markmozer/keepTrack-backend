/**
 * File: src/tests/integration/roles/roles.create.int.test.js
 */

import { randomUUID } from "node:crypto";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { createApp } from "../../../app/createApp.js";
import { getPrisma } from "../../../infrastructure/persistence/prisma/prismaClient.js";

describe("POST /api/roles", () => {
  const prisma = getPrisma();
  const { app } = createApp();

  beforeEach(async () => {
    await prisma.userRole.deleteMany();
    await prisma.role.deleteMany();
    await prisma.user.deleteMany();
    await prisma.tenant.deleteMany();
  });

  it("creates a role", async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: "Mozer Consulting",
        slug: "mozer-consulting",
        status: "ACTIVE",
      },
    });

    const response = await request(app).post("/api/roles").send({
      tenantId: tenant.id,
      name: "ADMIN",
    });

    expect(response.status).toBe(201);

    expect(response.body).toEqual({
      success: true,
      payload: {
        id: expect.any(String),
        tenantId: tenant.id,
        name: "ADMIN",
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
      error: null,
    });

    const row = await prisma.role.findUnique({
      where: {
        tenantId_name: {
          tenantId: tenant.id,
          name: "ADMIN",
        },
      },
    });

    expect(row).toBeTruthy();
    expect(row?.tenantId).toBe(tenant.id);
    expect(row?.name).toBe("ADMIN");
  });

  it("returns 409 when role name already exists in the same tenant", async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: "Mozer Consulting",
        slug: "mozer-consulting",
        status: "ACTIVE",
      },
    });

    await prisma.role.create({
      data: {
        id: randomUUID(),
        tenantId: tenant.id,
        name: "ADMIN",
      },
    });

    const response = await request(app).post("/api/roles").send({
      tenantId: tenant.id,
      name: "ADMIN",
    });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.payload).toBeNull();
    expect(response.body.error).toBeTruthy();
  });

  it("returns 422 when role name is invalid", async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: "Mozer Consulting",
        slug: "mozer-consulting",
        status: "ACTIVE",
      },
    });

    const response = await request(app).post("/api/roles").send({
      tenantId: tenant.id,
      name: "admin",
    });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.payload).toBeNull();
    expect(response.body.error).toBeTruthy();
  });
});