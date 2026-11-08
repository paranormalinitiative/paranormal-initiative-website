import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Builds only the Content Editor's Nova mode into its own committed directory,
// so the standalone /nova/ build output stays byte-for-byte unchanged.
export default defineConfig({
  base: "/content-editor-nova/",
  plugins: [react()],
  build: {
    outDir: "../content-editor-nova",
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: "content-editor.html",
      output: {
        manualChunks(id: string) {
          if (id.includes("node_modules/@tiptap") || id.includes("node_modules/prosemirror")) {
            return "nova-vendor-tiptap";
          }
          if (id.includes("node_modules/konva") || id.includes("node_modules/react-konva")) {
            return "nova-vendor-slides";
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
