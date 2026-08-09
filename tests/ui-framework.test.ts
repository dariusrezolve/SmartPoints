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

  it("uses the light green accent for primary actions", async () => {
    const button = await readFile(new URL("../app/components/ui/button.tsx", import.meta.url), "utf8");

    expect(button).toContain("bg-gradient-to-r");
    expect(button).toContain("from-emerald-600");
    expect(button).toContain("to-teal-600");
  });

  it("shares modern typography, surfaces, and focus treatments across the app", async () => {
    const [globals, card, input] = await Promise.all([
      readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
      readFile(new URL("../app/components/ui/card.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/components/ui/input.tsx", import.meta.url), "utf8"),
    ]);

    expect(globals).toContain("ui-sans-serif");
    expect(globals).toContain("-webkit-font-smoothing: antialiased");
    expect(card).toContain("backdrop-blur-xl");
    expect(card).toContain("bg-white/85");
    expect(input).toContain("focus:border-emerald-500");
    expect(input).toContain("focus:ring-emerald-100");
  });

  it("gives the current week label a clearly readable size", async () => {
    const workspace = await readFile(new URL("../app/components/points-workspace.tsx", import.meta.url), "utf8");

    expect(workspace).toContain("text-sm font-bold uppercase");
    expect(workspace).toContain("sm:text-base");
  });

  it("promotes action toasts above native modal dialogs", async () => {
    const workspace = await readFile(new URL("../app/components/points-workspace.tsx", import.meta.url), "utf8");

    expect(workspace).toContain('popover="manual"');
    expect(workspace).toContain("showPopover()");
  });

  it("aligns week navigation and menu controls to the same height", async () => {
    const workspace = await readFile(new URL("../app/components/points-workspace.tsx", import.meta.url), "utf8");

    expect(workspace).toContain('aria-label="Previous week" className="inline-flex h-10');
    expect(workspace).toContain('aria-label="Next week" className="inline-flex h-10');
  });
});
