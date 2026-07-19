/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages serves this project from a repo subpath. Applied to builds
  // only, so `npm run dev` keeps serving from `/`. Deploying anywhere
  // root-hosted (Vercel, Netlify) means dropping this line.
  base: command === "build" ? "/wyze-bundle-builder/" : "/",
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
}));
