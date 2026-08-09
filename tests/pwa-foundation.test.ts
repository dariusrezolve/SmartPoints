import { access, readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("iPhone PWA foundation", () => {
  it("defines an installable standalone manifest and service worker source", async () => {
    const manifest = await readFile(new URL("../app/manifest.ts", import.meta.url), "utf8");

    expect(manifest).toContain('display: "standalone"');
    expect(manifest).toContain('start_url: "/"');
    await access(new URL("../app/sw.ts", import.meta.url));
  });

  it("configures the Next build to generate the service worker", async () => {
    const nextConfig = await readFile(new URL("../next.config.ts", import.meta.url), "utf8");

    expect(nextConfig).toContain("withSerwist");
    expect(nextConfig).toContain('swSrc: "app/sw.ts"');
  });

  it("includes iPhone safe-area and touch-target rules", async () => {
    const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

    expect(css).toContain("safe-area-inset-bottom");
    expect(css).toContain("touch-action: manipulation");
  });

  it("offers iPhone Home Screen installation guidance in the workspace", async () => {
    const installTip = await readFile(new URL("../app/components/install-app-tip.tsx", import.meta.url), "utf8");

    expect(installTip).toContain("Install SmartPoints");
    expect(installTip).toContain("Add to Home Screen");
  });

  it("shows clear point-action feedback in the workspace", async () => {
    const workspace = await readFile(new URL("../app/components/points-workspace.tsx", import.meta.url), "utf8");

    expect(workspace).toContain("Points added");
    expect(workspace).toContain("Couldn't add points");
    expect(workspace).toContain("Saved for sync");
  });
});
