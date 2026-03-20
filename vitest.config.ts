import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    exclude: ["examples/**", "**/node_modules/**", "**/dist/**"],
    environment: "node",
    passWithNoTests: true,
  },
});
