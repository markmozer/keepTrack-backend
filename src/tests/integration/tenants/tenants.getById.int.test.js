/**
 * File: src/tests/integration/tenants/tenants.getById.int.test.js
 */

import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";

import { createApp } from "../../../app/createApp.js";
import { getPrisma } from "../../../infrastructure/persistence/prisma/prismaClient.js";

describe("GET /api/tenants/:tenantId", () => {
  const prisma = getPrisma();
  const { app } = createApp();

  beforeEach(async () => {
    await prisma.tenant.deleteMany();
  });

  it("returns tenant by id", async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: "Mozer Consulting",
        slug: "mozer-consulting",
        status: "ACTIVE",
      },
    });

    const response = await request(app).get(`/api/tenants/${tenant.id}`);

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      success: true,
      payload: {
        id: tenant.id,
        name: "Mozer Consulting",
        slug: "mozer-consulting",
        status: "ACTIVE",
      },
      error: null,
    });
  });

  it("returns 404 when tenant does not exist", async () => {
    const nonExistingId = randomUUID();

    const response = await request(app).get(
      `/api/tenants/${nonExistingId}`
    );

    expect(response.status).toBe(404);

    expect(response.body.success).toBe(false);
    expect(response.body.payload).toBeNull();
    expect(response.body.error).toBeTruthy();
  });
});