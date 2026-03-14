/**
 * File: src/tests/integration/users/users.create.int.test.js
 */


import { randomUUID } from "node:crypto";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { createApp } from "../../../app/createApp.js";
import { getPrisma } from "../../../infrastructure/persistence/prisma/prismaClient.js";

describe("POST /api/users", () => {
  const prisma = getPrisma();
  const { app } = createApp();

  beforeEach(async () => {
    await prisma.userRole.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    await prisma.tenant.deleteMany();
  });

  it("creates a user", async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: "Mozer Consulting",
        slug: "mozer-consulting",
        status: "ACTIVE",
      },
    });

    const response = await request(app).post("/api/users").send({
      tenantId: tenant.id,
      email: "Mark.Mozer@Example.com",
    });

    expect(response.status).toBe(201);

    expect(response.body).toEqual({
      success: true,
      payload: {
        id: expect.any(String),
        tenantId: tenant.id,
        email: "mark.mozer@example.com",
        status: "NEW",
        inviteTokenExpiresAt: null,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
      error: null,
    });

    const row = await prisma.user.findUnique({
      where: {
        tenantId_email: {
          tenantId: tenant.id,
          email: "mark.mozer@example.com",
        },
      },
    });

    expect(row).toBeTruthy();
    expect(row?.tenantId).toBe(tenant.id);
    expect(row?.email).toBe("mark.mozer@example.com");
    expect(row?.status).toBe("NEW");
  });

  it("returns 404 when tenant does not exist", async () => {
    const response = await request(app).post("/api/users").send({
      tenantId: randomUUID(),
      email: "mark.mozer@example.com",
    });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.payload).toBeNull();
    expect(response.body.error).toBeTruthy();
  });

  it("returns 409 when email already exists in the same tenant", async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: "Mozer Consulting",
        slug: "mozer-consulting",
        status: "ACTIVE",
      },
    });

    await prisma.user.create({
      data: {
        id: randomUUID(),
        tenantId: tenant.id,
        email: "mark.mozer@example.com",
        status: "NEW",
      },
    });

    const response = await request(app).post("/api/users").send({
      tenantId: tenant.id,
      email: "Mark.Mozer@Example.com",
    });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.payload).toBeNull();
    expect(response.body.error).toBeTruthy();
  });

  it("returns 422 when email is invalid", async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: "Mozer Consulting",
        slug: "mozer-consulting",
        status: "ACTIVE",
      },
    });

    const response = await request(app).post("/api/users").send({
      tenantId: tenant.id,
      email: "not-an-email",
    });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.payload).toBeNull();
    expect(response.body.error).toBeTruthy();
  });
});