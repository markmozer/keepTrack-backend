/**
 * File: src/tests/integration/users/users.acceptInvite.int.test.js
 */


import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { createApp } from "../../../app/createApp.js";
import { getPrisma } from "../../../infrastructure/persistence/prisma/prismaClient.js";
import { createHash } from "node:crypto";

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

describe("POST /api/users/accept-invite", () => {
  const prisma = getPrisma();
  const { app } = createApp();

  beforeEach(async () => {
    await prisma.userRole.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    await prisma.tenant.deleteMany();
  });

  it("accepts a valid invite and activates the user", async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: "Mozer Consulting",
        slug: "mozer-consulting",
        status: "ACTIVE",
      },
    });

    const tokenPlain = "invite-token-123";
    const inviteTokenHash = sha256(tokenPlain);

    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: "mark@mozer-consulting.com",
        status: "INVITED",
        inviteTokenHash,
        inviteTokenExpiresAt: new Date("2026-03-30T10:00:00.000Z"),
      },
    });

    const response = await request(app).post("/api/users/accept-invite").send({
      token: tokenPlain,
      password: "StrongPass123",
    });

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      success: true,
      payload: {
        id: user.id,
        tenantId: tenant.id,
        email: "mark@mozer-consulting.com",
        inviteTokenExpiresAt: null,
        status: "ACTIVE",
      },
      error: null,
    });

    const updated = await prisma.user.findUnique({
      where: { id: user.id },
    });

    expect(updated).toBeTruthy();
    expect(updated?.status).toBe("ACTIVE");
    expect(updated?.passwordHash).toBeTruthy();
    expect(updated?.inviteTokenHash).toBeNull();
    expect(updated?.inviteTokenExpiresAt).toBeNull();
  });

  it("returns 422 when token is invalid", async () => {
    const response = await request(app).post("/api/users/accept-invite").send({
      tokenPlain: "non-existing-token",
      passwordPlain: "StrongPass123",
    });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.payload).toBeNull();
    expect(response.body.error).toBeTruthy();
  });

  it("returns 422 when invite token has expired", async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: "Mozer Consulting",
        slug: "mozer-consulting",
        status: "ACTIVE",
      },
    });

    const tokenPlain = "expired-token-123";
    const inviteTokenHash = sha256(tokenPlain);

    await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: "mark@mozer-consulting.com",
        status: "INVITED",
        inviteTokenHash,
        inviteTokenExpiresAt: new Date("2026-03-01T10:00:00.000Z"),
      },
    });

    const response = await request(app).post("/api/users/accept-invite").send({
      tokenPlain,
      passwordPlain: "StrongPass123",
    });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.payload).toBeNull();
    expect(response.body.error).toBeTruthy();
  });

  it("returns 422 when password does not meet policy", async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: "Mozer Consulting",
        slug: "mozer-consulting",
        status: "ACTIVE",
      },
    });

    const tokenPlain = "valid-token-weak-password";
    const inviteTokenHash = sha256(tokenPlain);

    await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: "mark@mozer-consulting.com",
        status: "INVITED",
        inviteTokenHash,
        inviteTokenExpiresAt: new Date("2026-03-30T10:00:00.000Z"),
      },
    });

    const response = await request(app).post("/api/users/accept-invite").send({
      tokenPlain,
      passwordPlain: "weak",
    });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.payload).toBeNull();
    expect(response.body.error).toBeTruthy();
  });

  it("does not allow the same invite token to be used twice", async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: "Mozer Consulting",
        slug: "mozer-consulting",
        status: "ACTIVE",
      },
    });

    const tokenPlain = "one-time-token-123";
    const inviteTokenHash = sha256(tokenPlain);

    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: "mark@mozer-consulting.com",
        status: "INVITED",
        inviteTokenHash,
        inviteTokenExpiresAt: new Date("2026-03-30T10:00:00.000Z"),
      },
    });

    const firstResponse = await request(app).post("/api/users/accept-invite").send({
      token: tokenPlain,
      password: "StrongPass123",
    });

    expect(firstResponse.status).toBe(200);

    const secondResponse = await request(app).post("/api/users/accept-invite").send({
      token: tokenPlain,
      password: "AnotherPass123",
    });

    expect(secondResponse.status).toBe(422);
    expect(secondResponse.body.success).toBe(false);
    expect(secondResponse.body.payload).toBeNull();
    expect(secondResponse.body.error).toBeTruthy();

    const updated = await prisma.user.findUnique({
      where: { id: user.id },
    });

    expect(updated?.status).toBe("ACTIVE");
    expect(updated?.inviteTokenHash).toBeNull();
    expect(updated?.inviteTokenExpiresAt).toBeNull();
  });
});
