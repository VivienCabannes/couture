import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@shared": fileURLToPath(new URL("../shared/src", import.meta.url)),
    },
    dedupe: ["react", "react-dom"],
  },

  // Prevent Vite from obscuring Rust compiler errors
  clearScreen: false,

  server: {
    port: 5173,
    strictPort: true,
    host: host || false,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },

  // Allow Tauri env variables alongside Vite ones
  envPrefix: ["VITE_", "TAURI_ENV_*"],

  build: {
    // Browser compatibility targets for Tauri webviews
    target: process.env.TAURI_ENV_PLATFORM === "windows" ? "chrome105" : "safari13",
    // Produce sourcemaps for debug builds
    minify: !process.env.TAURI_ENV_DEBUG ? "esbuild" : false,
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
  },
});
