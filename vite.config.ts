/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";

export default defineConfig(() => {
  return {
    plugins: [react()],
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
