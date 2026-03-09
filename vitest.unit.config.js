import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "unit",
    include: ["src/tests/unit/**/*.test.js"],
    exclude: ["src/**/*.int.test.js"],
    environment: "node",
    globals: true,
    pool: "threads",
  },
});
