import { defineConfig } from "@playwright/test";

const BASE = "http://127.0.0.1:4173";

// Runs against the production build (`npm run test:e2e` builds first).
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: BASE,
    browserName: "chromium",
    permissions: ["clipboard-read", "clipboard-write"],
  },
  projects: [
    { name: "mobile-375", use: { viewport: { width: 375, height: 812 } } },
    { name: "tablet-768", use: { viewport: { width: 768, height: 1024 } } },
    { name: "desktop-1440", use: { viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: "npx vite preview --host 127.0.0.1 --port 4173 --strictPort",
    url: BASE,
    reuseExistingServer: true,
  },
});
