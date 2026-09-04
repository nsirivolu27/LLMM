import { resolve } from "node:path";
import { defineConfig } from "vite";

const api = "http://127.0.0.1:3100";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        console: resolve(import.meta.dirname, "console.html"),
      },
    },
  },
  server: {
    proxy: {
      "/api": api,
      "/share": api,
      "/health": api,
    },
  },
});
