/**
 * File: src/tests/unit/domain/shared/validation/required.test.js
 */

import { describe, it, expect } from "vitest";
import { v } from "../../../../../domain/shared/validation/validators.js";
import { ValidationError } from "../../../../../domain/shared/errors/index.js";

describe("validators (v)", () => {
  describe("v.required", () => {
    // ✅ Happy flow - meerdere types
    it.each([
      ["string", "some value"],
      ["number", 123],
      ["array", ["a", 1, { x: true }]],
      ["object", { id: "1", name: "Mark" }],
      ["date", new Date()],
      ["boolean", true],
    ])(
      "returns the input unchanged when value is a %s",
      (_type, input) => {
        // Act
        const result = v.required(input, "input");

        // Assert
        expect(result).toBe(input);
      }
    );

    // ✅ Zonder name argument
    it.each([
      ["string", "abc"],
      ["number", 42],
    ])("returns input when name is omitted (%s)", (_type, input) => {
      const result = v.required(input);
      expect(result).toBe(input);
    });

    // ❌ Error cases
    it.each([
      ["undefined", undefined],
      ["null", null],
    ])("throws ValidationError when value is %s", (_type, input) => {
      expect(() => {
        v.required(input, "input");
      }).toThrow(ValidationError);
    });

    // ❌ Error ook zonder name
    it.each([
      ["undefined", undefined],
      ["null", null],
    ])(
      "throws ValidationError when value is %s even if name is omitted",
      (_type, input) => {
        expect(() => {
          v.required(input);
        }).toThrow(ValidationError);
      }
    );

    // ⭐ Bonus: error message kwaliteit
    it("includes field name in error message", () => {
      expect(() => {
        v.required(undefined, "email");
      }).toThrow(/email/i);
    });
  });
});