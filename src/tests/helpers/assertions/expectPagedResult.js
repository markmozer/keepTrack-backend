/**
 * File: src/tests/helpers/assertions/expectPagedResult.js
 */

import { expect } from "vitest";

export function expectPagedResult(result, { page, pageSize }) {
  expect(result).toMatchObject({
    items: expect.any(Array),
    page,
    pageSize,
    totalItems: expect.any(Number),
    totalPages: expect.any(Number),
  });

  expect(result.page).toBeGreaterThanOrEqual(1);
  expect(result.pageSize).toBeGreaterThan(0);
  expect(result.totalItems).toBeGreaterThanOrEqual(0);
  expect(result.totalPages).toBeGreaterThanOrEqual(0);
}