import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("development startup", () => {
  it("applies linked pending migrations before starting Next.js", async () => {
    const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8")) as { scripts: Record<string, string> };

    expect(packageJson.scripts.dev).toContain("scripts/development-start.sh");
  });
});
