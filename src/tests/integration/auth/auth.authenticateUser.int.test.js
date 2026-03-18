/**
 * File: src/tests/integration/auth/auth.authenticateUser.int.test.js
 */

import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { createApp } from "../../../app/createApp.js";
import { getPrisma } from "../../../infrastructure/persistence/prisma/prismaClient.js";
import { PasswordHasherBcrypt } from "../../../infrastructure/services/security/PasswordHasherBcrypt.js";
import { assertPasswordServicePort } from "../../../application/ports/security/PasswordServicePort.js";


/**
 * Pas deze helper aan als jouw tenantResolutionMiddleware iets anders verwacht.
 * Voorbeeld hieronder gaat uit van slug-based tenant resolution via Host header.
 *
 * @param {import("supertest").Test} req
 * @param {string} tenantSlug
 */
function withTenant(req, tenantSlug) {
  return req.set("Host", `${tenantSlug}.localhost`);
}

const passwordService = new PasswordHasherBcrypt();
assertPasswordServicePort(passwordService);

describe("POST /api/auth/login", () => {
  const prisma = getPrisma();
  const { app } = createApp();

  beforeEach(async () => {
    await prisma.userRole.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    await prisma.tenant.deleteMany();

    
  });

  it("authenticates an active user, returns 200, and sets session cookie", async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: "Mozer Consulting",
        slug: "mozer-consulting",
        status: "ACTIVE",
      },
    });

    const passwordPlain = "StrongPass123";

    // Maak hier gebruik van jouw echte password service/hash als je die beschikbaar hebt in tests.
    // Als jouw testcontainer al een echte bcrypt/argon service gebruikt in AcceptInvite,
    // kun je ook eerst Invite + Accept flow doen. Voor eenvoud seeden we hieronder direct een hash.
    // VERVANG DIT als jouw project een helper/service heeft:
    const passwordHash = await passwordService.hash(passwordPlain);

    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: "mark@mozer-consulting.com",
        passwordHash,
        status: "ACTIVE",
      },
    });

    const roleAdmin = await prisma.role.create({
      data: {
        tenantId: tenant.id,
        name: "ADMIN",
      },
    });

    const roleUser = await prisma.role.create({
      data: {
        tenantId: tenant.id,
        name: "USER",
      },
    });

    await prisma.userRole.createMany({
      data: [
        {
          tenantId: tenant.id,
          userId: user.id,
          roleId: roleAdmin.id,
          validFrom: new Date("2026-03-01T10:00:00.000Z"),
          validTo: null,
        },
        {
          tenantId: tenant.id,
          userId: user.id,
          roleId: roleUser.id,
          validFrom: new Date("2026-03-01T10:00:00.000Z"),
          validTo: null,
        },
      ],
    });

    const response = await withTenant(
      request(app).post("/api/auth/login"),
      tenant.slug,
    ).send({
      email: "mark@mozer-consulting.com",
      password: passwordPlain,
    });

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      success: true,
      payload: {
        user: {
          userId: user.id,
          tenantId: tenant.id,
          status: "ACTIVE",
          roleNames: expect.arrayContaining(["ADMIN", "USER"]),
        },
      },
      error: null,
    });

    const setCookie = response.headers["set-cookie"];
    expect(setCookie).toBeTruthy();
    expect(Array.isArray(setCookie)).toBe(true);
    expect(setCookie[0]).toContain("sid=");
  });

  it("returns 401 when password is invalid", async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: "Mozer Consulting",
        slug: "mozer-consulting",
        status: "ACTIVE",
      },
    });

    const passwordHash = await passwordService.hash("StrongPass123"); // vervang door geldige hash van StrongPass123

    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: "mark@mozer-consulting.com",
        passwordHash,
        status: "ACTIVE",
      },
    });

    const role = await prisma.role.create({
      data: {
        tenantId: tenant.id,
        name: "USER",
      },
    });

    await prisma.userRole.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        roleId: role.id,
        validFrom: new Date("2026-03-01T10:00:00.000Z"),
        validTo: null,
      },
    });

    const response = await withTenant(
      request(app).post("/api/auth/login"),
      tenant.slug,
    ).send({
      email: "mark@mozer-consulting.com",
      password: "WrongPassword123",
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.payload).toBeNull();
    expect(response.body.error).toBeTruthy();
  });

  it("returns 401 when user does not exist", async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: "Mozer Consulting",
        slug: "mozer-consulting",
        status: "ACTIVE",
      },
    });

    const response = await withTenant(
      request(app).post("/api/auth/login"),
      tenant.slug,
    ).send({
      email: "unknown@mozer-consulting.com",
      password: "StrongPass123",
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.payload).toBeNull();
    expect(response.body.error).toBeTruthy();
  });

  it("returns 401 when user status is not ACTIVE", async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: "Mozer Consulting",
        slug: "mozer-consulting",
        status: "ACTIVE",
      },
    });

    const passwordHash = await passwordService.hash("StrongPass123"); // vervang door geldige hash van StrongPass123

    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: "mark@mozer-consulting.com",
        passwordHash,
        status: "INVITED",
      },
    });

    const role = await prisma.role.create({
      data: {
        tenantId: tenant.id,
        name: "USER",
      },
    });

    await prisma.userRole.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        roleId: role.id,
        validFrom: new Date("2026-03-01T10:00:00.000Z"),
        validTo: null,
      },
    });

    const response = await withTenant(
      request(app).post("/api/auth/login"),
      tenant.slug,
    ).send({
      email: "mark@mozer-consulting.com",
      password: "StrongPass123",
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.payload).toBeNull();
    expect(response.body.error).toBeTruthy();
  });

  it("returns 403 when user has no valid roles", async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: "Mozer Consulting",
        slug: "mozer-consulting",
        status: "ACTIVE",
      },
    });

    const passwordHash = await passwordService.hash("StrongPass123"); // vervang door geldige hash van StrongPass123

    await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: "mark@mozer-consulting.com",
        passwordHash,
        status: "ACTIVE",
      },
    });

    const response = await withTenant(
      request(app).post("/api/auth/login"),
      tenant.slug,
    ).send({
      email: "mark@mozer-consulting.com",
      password: "StrongPass123",
    });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.payload).toBeNull();
    expect(response.body.error).toBeTruthy();
  });
});