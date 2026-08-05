import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(dirname, "./src"),
      "@app": path.resolve(dirname, "./src/app"),
      "@core": path.resolve(dirname, "./src/core"),
      "@shared": path.resolve(dirname, "./src/shared"),
      "@modules": path.resolve(dirname, "./src/modules"),
    },
  },
});
