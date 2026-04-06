/**
 * File: src/tests/helpers/assertions/expectAppError.js
 */
import { expect } from "vitest";

export function expectAppError(response, status, code) {
  expect(response.status).toBe(status);

  expect(response.body).toMatchObject({
    success: false,
    payload: null,
    error: expect.any(Object),
  });

  if (code) {
    expect(response.body.error.code).toBe(code);
  }
}