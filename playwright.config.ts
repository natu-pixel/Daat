import { defineConfig } from "@playwright/test";

const port = process.env.PW_PORT || "3000";
if (!/^\d+$/.test(port) || Number(port) < 1024 || Number(port) > 65535) throw new Error("PW_PORT must be a valid unprivileged port.");
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  use: {
    baseURL,
    browserName: "chromium",
    channel: process.env.PW_BROWSER_CHANNEL || "msedge",
    reducedMotion: "no-preference",
    viewport: { width: 1440, height: 900 },
    screenshot: "only-on-failure",
  },
  webServer: {
    command: `npm run start -- --port ${port}`,
    url: baseURL,
    env: { SITE_URL: baseURL },
    reuseExistingServer: true,
    timeout: 90_000,
  },
});
