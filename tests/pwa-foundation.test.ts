import { access, readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("iPhone PWA foundation", () => {
  it("defines an installable standalone manifest and service worker source", async () => {
    const manifest = await readFile(new URL("../app/manifest.ts", import.meta.url), "utf8");

    expect(manifest).toContain('display: "standalone"');
    expect(manifest).toContain('start_url: "/~offline"');
    expect(manifest).toContain('theme_color: "#059669"');
    await access(new URL("../app/sw.ts", import.meta.url));
  });

  it("uses the emerald task-card mark for browser and iPhone icons", async () => {
    const [browserIcon, appleIcon] = await Promise.all([
      readFile(new URL("../app/icon.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/apple-icon.tsx", import.meta.url), "utf8"),
    ]);

    expect(browserIcon).toContain("linear-gradient(135deg, #059669, #0d9488)");
    expect(browserIcon).toContain("M14 33 26 45 51 19");
    expect(browserIcon).toContain("M27 12v30");
    expect(browserIcon).toContain("#f59e0b");
    expect(appleIcon).toContain('export { contentType, default, size } from "./icon"');
  });

  it("configures the Next build to generate the service worker", async () => {
    const [nextConfig, serviceWorker] = await Promise.all([
      readFile(new URL("../next.config.ts", import.meta.url), "utf8"),
      readFile(new URL("../app/sw.ts", import.meta.url), "utf8"),
    ]);

    expect(nextConfig).toContain("withSerwist");
    expect(nextConfig).toContain('swSrc: "app/sw.ts"');
    expect(serviceWorker).toContain("runtimeCaching: []");
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
