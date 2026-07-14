import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: ".",
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        assets: resolve(__dirname, "pages/assets.html"),
        changelog: resolve(__dirname, "pages/changelog.html"),
        contact: resolve(__dirname, "pages/contact.html"),
        help: resolve(__dirname, "pages/help.html"),
        license: resolve(__dirname, "pages/license.html"),
        policy: resolve(__dirname, "pages/policy.html"),
        terms: resolve(__dirname, "pages/terms.html"),
      },
    },
  },
});
