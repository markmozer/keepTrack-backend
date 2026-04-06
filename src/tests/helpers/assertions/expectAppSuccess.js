/**
 * File: src/tests/helpers/assertions/expectAppSuccess.js
 */

import { expect } from "vitest";

export function expectAppSuccess(response, { status = 200 } = {}) {
  expect(response.status).toBe(status);

  expect(response.body).toMatchObject({
    success: true,
    error: null,
  });

  expect(response.body.payload).not.toBeNull();
}

export function expectAppSuccessWithPayload(
  response,
  { status = 200 } = {}
) {
  expectAppSuccess(response, { status });
  return response.body.payload;
}