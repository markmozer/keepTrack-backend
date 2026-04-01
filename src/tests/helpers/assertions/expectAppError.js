/**
 * File: src/tests/helpers/assertions/expectAppError.js
 */

export function expectAppError(response, statusCode) {
  expect(response.status).toBe(statusCode);
  expect(response.body.success).toBe(false);
  expect(response.body.error).toBeTruthy();
}