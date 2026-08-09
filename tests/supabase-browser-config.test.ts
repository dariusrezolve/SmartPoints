import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("Supabase browser configuration", () => {
  it("uses statically referenced public variables so Next.js includes them in browser bundles", async () => {
    const source = await readFile(new URL("../lib/supabase/env.ts", import.meta.url), "utf8");

    expect(source).toContain("process.env.NEXT_PUBLIC_SUPABASE_URL");
    expect(source).toContain("process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
    expect(source).not.toContain("process.env[variableName]");
  });
});
