/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  // Emit relative asset URLs so the same build works whether it is served from
  // a domain root (Vercel, Netlify) or a repo subpath (GitHub Pages). Pairs
  // with `asset()` in src/utils, which resolves the runtime paths held in the
  // catalog the same way.
  base: "./",
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
