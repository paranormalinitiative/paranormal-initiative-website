import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Nova builds into the repository's committed `nova/` asset directory, which
// the Worker serves at /nova/. The StudioFlow application is a separate build
// with its own dependencies and is never imported here.
export default defineConfig({
  base: "/nova/",
  plugins: [react()],
  build: {
    outDir: "../nova",
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("node_modules/@tiptap") || id.includes("node_modules/prosemirror")) {
            return "nova-vendor-tiptap";
          }
          if (id.includes("node_modules/react") || id.includes("node_modules/scheduler")) {
            return "nova-vendor-react";
          }
          return undefined;
        }
      }
    }
  }
});
