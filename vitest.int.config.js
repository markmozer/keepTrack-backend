import { defineConfig } from "vitest/config";


export default defineConfig({
  test: {
    name: "integration",
    include: ["src/tests/integration/**/*.int.test.js"],
    environment: "node",
    setupFiles: ["./src/tests/setup/setupEnv.js"],

    // ⛔ ZEER BELANGRIJK voor Prisma
    pool: "forks",
    maxConcurrency: 1,
    sequence: {
      concurrent: false,
    },

    globals: true,
    // 🔴 essentieel voor DB-integratietests
    fileParallelism: false,
  },
});
