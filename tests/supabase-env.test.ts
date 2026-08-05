import { afterEach, describe, expect, it } from "vitest";
import { getSupabaseConfig, hasSupabaseConfig } from "../lib/supabase/env";

const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

afterEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = originalKey;
});

describe("Supabase configuration", () => {
  it("is absent unless both public values are provided", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    expect(hasSupabaseConfig()).toBe(false);
    expect(() => getSupabaseConfig()).toThrow("Supabase is not configured");
  });

  it("returns only public connection values", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "publishable-key";
    expect(getSupabaseConfig()).toEqual({
      url: "https://project.supabase.co",
      publishableKey: "publishable-key",
    });
  });
});
