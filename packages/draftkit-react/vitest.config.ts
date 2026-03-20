import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Prefer source (.tsx/.ts) over compiled (.js) so stale tsc artifacts never shadow tests
    extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
  },
  test: {
    environment: "jsdom",
    globals: false,
  },
});
