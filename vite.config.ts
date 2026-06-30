import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api/parry": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (requestPath) => requestPath.replace(/^\/api\/parry/, "/_parry"),
      },
    },
  },
});
