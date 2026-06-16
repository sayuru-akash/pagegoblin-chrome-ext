import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

// https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  srcDir: "src",
  manifest: {
    name: "PageGoblin — Website Roast & Conversion Teardown",
    description: "The tiny goblin that judges your website. Instant Goblin Score, trust & CTA teardown.",
    version: "1.0.0",
    permissions: ["activeTab", "scripting", "storage"],
    host_permissions: ["https://pagegoblin.org/*"],
    action: {
      default_title: "Roast this page",
    },
    icons: {
      "16": "icon/16.png",
      "32": "icon/32.png",
      "48": "icon/48.png",
      "128": "icon/128.png",
    },
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
