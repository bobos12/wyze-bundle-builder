/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  // Emit relative asset URLs so one build works served from a domain root or
  // from a subpath, with no per-host configuration. Pairs with `asset()` in
  // src/utils, which resolves the runtime paths held in the catalog the same
  // way.
  base: "./",
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
