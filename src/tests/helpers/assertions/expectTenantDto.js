/**
 * File: src/tests/helpers/assertions/expectTenantDto.js
 */

import { expect } from "vitest";
import { expectValidDate } from "./expectValidDate.js";

export function expectTenantDto(actual, expected = {}) {
  expect(actual).toEqual({
    id: expect.any(String),
    name: expected.name ?? expect.any(String),
    slug: expected.slug ?? expect.any(String),
    status: expected.status ?? expect.any(String),
    type: expected.type ?? expect.any(String),
  });
}