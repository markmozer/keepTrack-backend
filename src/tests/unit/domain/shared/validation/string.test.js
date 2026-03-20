/**
 * File: src/tests/unit/domain/shared/validation/string.test.js
 */

import { describe, it, expect } from "vitest";
import { v } from "../../../../../domain/shared/validation/validators.js";
import { ValidationError } from "../../../../../domain/shared/errors/index.js";

describe("validators (v)", () => {
  describe("v.string", () => {
    const stringIn = "  Mark@Mozer-Consulting.com  ";
    const stringTrimmed = stringIn.trim();
    const invalidEmail = "mark$mozer-consulting.com";
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    it.each([
      {
        value: stringIn,
        name: "input",
        options: undefined,
        expected: stringTrimmed,
        test: "trim by default",
      },
      {
        value: stringIn,
        name: "input",
        options: { trim: false },
        expected: stringIn,
        test: "trim = false",
      },
      {
        value: stringIn,
        name: "input",
        options: { min: stringTrimmed.length, max: stringTrimmed.length },
        expected: stringTrimmed,
        test: "apply min/max after trim",
      },
      {
        value: stringIn,
        name: "input",
        options: { trim: true, pattern: emailPattern },
        expected: stringTrimmed,
        test: "pattern match",
      },
    ])("returns the string applying $test", ({ value, name, options, expected }) => {
      const result = v.string(value, name, options);
      expect(result).toBe(expected);
    });

    it.each([
      {
        value: undefined,
        name: "input",
        options: undefined,
        test: "undefined input",
      },
      {
        value: null,
        name: "input",
        options: { trim: true },
        test: "null input",
      },
      {
        value: "   ",
        name: "input",
        test: "blank string after trim",
      },
      {
        value: 123,
        name: "input",
        options: { trim: true, min: stringIn.length },
        test: "input not string",
      },
      {
        value: stringIn,
        name: "input",
        options: { trim: true, min: stringIn.length },
        test: "trimmed < min",
      },
      {
        value: stringIn,
        name: "input",
        options: { max: stringTrimmed.length - 1 },
        test: "trimmed > max",
      },
      {
        value: invalidEmail,
        name: "input",
        options: { trim: true, pattern: emailPattern },
        test: "wrong pattern",
      },
    ])("throws ValidationError for $test", ({ value, name, options }) => {
      expect(() => {
        v.string(value, name, options);
      }).toThrow(ValidationError);
    });
  });
});