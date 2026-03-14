/**
 * File: src/tests/integration/tenants/tenants.create.int.test.js
 */

import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../../app/createApp.js";
import { getPrisma } from "../../../infrastructure/persistence/prisma/prismaClient.js";

describe("POST /api/tenants", () => {
  const prisma = getPrisma();
  const { app } = createApp();

  beforeEach(async () => {
    await prisma.tenant.deleteMany();
  });

  it("creates a tenant", async () => {
    const response = await request(app).post("/api/tenants").send({
      name: "Mozer Consulting",
      slug: "mozer-consulting",
    });

    expect(response.status).toBe(201);

    expect(response.body).toEqual({
      success: true,
      payload: {
        id: expect.any(String),
        name: "Mozer Consulting",
        slug: "mozer-consulting",
        status: "ACTIVE",
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
      error: null,
    });

    const row = await prisma.tenant.findUnique({
      where: { slug: "mozer-consulting" },
    });

    expect(row).toBeTruthy();
    expect(row?.name).toBe("Mozer Consulting");
    expect(row?.slug).toBe("mozer-consulting");
    expect(row?.status).toBe("ACTIVE");
  });
  it("returns 409 when slug already exists", async () => {
    await prisma.tenant.create({
      data: {
        name: "Mozer Consulting",
        slug: "mozer-consulting",
        status: "ACTIVE",
      },
    });

    const response = await request(app).post("/api/tenants").send({
      name: "Another Name",
      slug: "mozer-consulting",
    });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
  });

  it("returns 422 when slug is invalid", async () => {
    const response = await request(app).post("/api/tenants").send({
      name: "Mozer Consulting",
      slug: "Mozer Consulting",
    });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
  });
});
