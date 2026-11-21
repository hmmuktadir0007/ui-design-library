import { defineConfig } from "@playwright/test";

const BASE = "http://127.0.0.1:4173";

// Runs against the production build (`npm run test:e2e` builds first).
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  workers: 4, // the default (half the cores) starves the preview server and Chromium on this machine; 4 keeps runs stable
  reporter: [["list"]],
  expect: { timeout: 10_000 }, // lazy preview chunks can take >5s to render when 8 workers share the machine
  use: {
    baseURL: BASE,
  },
  projects: [
    {
      name: "mobile-375",
      testIgnore: /cross-browser\.spec\.ts/,
      use: { browserName: "chromium", viewport: { width: 375, height: 812 }, permissions: ["clipboard-read", "clipboard-write"] },
    },
    {
      name: "tablet-768",
      testIgnore: /cross-browser\.spec\.ts/,
      use: { browserName: "chromium", viewport: { width: 768, height: 1024 }, permissions: ["clipboard-read", "clipboard-write"] },
    },
    {
      name: "desktop-1440",
      testIgnore: /cross-browser\.spec\.ts/,
      use: { browserName: "chromium", viewport: { width: 1440, height: 900 }, permissions: ["clipboard-read", "clipboard-write"] },
    },
    {
      name: "firefox",
      testMatch: /cross-browser\.spec\.ts/,
      use: { browserName: "firefox", viewport: { width: 1280, height: 800 } },
    },
    {
      name: "webkit",
      testMatch: /cross-browser\.spec\.ts/,
      use: { browserName: "webkit", viewport: { width: 1280, height: 800 } },
    },
    {
      name: "mobile-touch",
      testMatch: /cross-browser\.spec\.ts/,
      use: { browserName: "chromium", viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true },
    },
  ],
  webServer: {
    command: "npx vite preview --host 127.0.0.1 --port 4173 --strictPort",
    url: BASE,
    reuseExistingServer: true,
  },
});
