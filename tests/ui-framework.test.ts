import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("WayWeGo UI framework", () => {
  it("includes the Tailwind and component-variant dependencies used by WayWeGo", async () => {
    const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8")) as { dependencies: Record<string, string>; devDependencies: Record<string, string> };

    expect(packageJson.devDependencies.tailwindcss).toBeDefined();
    expect(packageJson.devDependencies["@tailwindcss/postcss"]).toBeDefined();
    expect(packageJson.dependencies["class-variance-authority"]).toBeDefined();
    expect(packageJson.dependencies.clsx).toBeDefined();
    expect(packageJson.dependencies["tailwind-merge"]).toBeDefined();
  });

  it("uses WayWeGo's sky accent for primary actions", async () => {
    const button = await readFile(new URL("../app/components/ui/button.tsx", import.meta.url), "utf8");

    expect(button).toContain("bg-sky-600");
    expect(button).toContain("hover:bg-sky-700");
  });
});
