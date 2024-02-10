/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      visualizer({
        template: "treemap",
        open: true,
        gzipSize: true,
        filename: "dist/stats.html",
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    test: {
      includeSource: ["src/**/*.{js,jsx,ts,tsx}"],
    },
    define: {
      "import.meta.vitest": false,
    },
  };
});
