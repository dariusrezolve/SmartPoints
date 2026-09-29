import { describe, expect, it } from "vitest";
import { assertIsolatedConfig, assertLocalApiUrl } from "../scripts/e2e/safety.mjs";

describe("E2E target safety", () => {
  it("rejects the normal local project and any hosted destination", () => {
    expect(() => assertIsolatedConfig('project_id = "SmartPoints"\n[api]\nport = 54321')).toThrow();
    expect(() => assertLocalApiUrl("https://example.supabase.co", 55321)).toThrow();
    expect(() => assertLocalApiUrl("http://127.0.0.1:54321", 55321)).toThrow();
  });

  it("accepts only the dedicated project and loopback API port", () => {
    const config = 'project_id = "SmartPointsE2E"\n[api]\nport = 55321\n[db]\nport = 55322\n[auth]\nsite_url = "http://127.0.0.1:3100"\n[auth.email]\nenable_confirmations = false';
    expect(() => assertIsolatedConfig(config)).not.toThrow();
    expect(() => assertIsolatedConfig(config.replace("55322", "54322"))).toThrow();
    expect(() => assertLocalApiUrl("http://127.0.0.1:55321", 55321)).not.toThrow();
  });
});
