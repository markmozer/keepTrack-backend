/**
 * File: src/tests/helpers/assertions/expectTenantAdminDto.js
 */


import { expect } from "vitest";
import { expectValidDate } from "./expectValidDate.js";

export function expectTenantAdminDto(actual, expected = {}) {
  expect(actual).toEqual({
    id: expect.any(String),
    name: expected.name ?? expect.any(String),
    slug: expected.slug ?? expect.any(String),
    status: expected.status ?? expect.any(String),
    type: expected.type ?? expect.any(String),
    createdAt: expect.any(String),
    updatedAt: expect.any(String),
  });

  expectValidDate(actual.createdAt);
  expectValidDate(actual.updatedAt);
}