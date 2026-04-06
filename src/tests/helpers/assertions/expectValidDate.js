/**
 * File: src/tests/helpers/assertions/expectValidDate.js
 */
import { expect } from "vitest";

export function expectValidDate(value) {
  expect(typeof value).toBe("string");

  const date = new Date(value);
  expect(date.toString()).not.toBe("Invalid Date");
}