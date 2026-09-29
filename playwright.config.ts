import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 120_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  outputDir: "test-results",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://127.0.0.1:3100",
    ...devices["Desktop Chrome"],
    serviceWorkers: "block",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    actionTimeout: 10_000,
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
