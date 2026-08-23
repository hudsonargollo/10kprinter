import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  build: {
    outDir: "../public",
    // false: the dashboard build (landing/vite.config.ts's sibling) writes into public/app/ —
    // build landing first, dashboard second, so this never wipes that subfolder either way.
    emptyOutDir: false,
  },
});
