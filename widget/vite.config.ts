import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Builds into `app/`, which is the folder layout a Zoho Creator widget zip
 * expects alongside plugin-manifest.json. Matches the editorial widget's
 * proven packaging exactly.
 */
export default defineConfig({
  base: "./",
  build: {
    outDir: "app",
    emptyOutDir: true,
    rollupOptions: { output: { entryFileNames: "assets/[name].js", assetFileNames: "assets/[name][extname]" } },
  },
});
