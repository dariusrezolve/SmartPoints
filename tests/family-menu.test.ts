import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("family menu", () => {
  it("keeps profile, setup, and sign-out controls in one menu with dialogs outside it", async () => {
    const component = await readFile(new URL("../app/components/workspace-menu.tsx", import.meta.url), "utf8");

    expect(component).toContain("<details");
    expect(component).toContain("pointerdown");
    expect(component).toContain('role="menu"');
    expect(component).toContain('action="/auth/sign-out"');
    expect(component).toContain("Reset this week");
    expect(component).toContain("Install app");
    expect(component).toContain('openModal("install")');
    expect(component).toContain("beforeinstallprompt");
    expect(component).toContain("Add to Home Screen");
    expect(component).toContain("h-10");
    expect(component).toContain('name="confirmReset"');
    expect(component.indexOf('action="/auth/sign-out"')).toBeLessThan(component.indexOf("</details>"));
    expect(component.indexOf("<WorkspaceModal")).toBeGreaterThan(component.indexOf("</details>"));
  });

  it("shares only the public app link immediately above the install action", async () => {
    const component = await readFile(new URL("../app/components/workspace-menu.tsx", import.meta.url), "utf8");

    expect(component).toContain("Share app");
    expect(component.indexOf("Share app")).toBeLessThan(component.indexOf("Install app"));
    expect(component).toContain('new URL("/", window.location.origin).toString()');
    expect(component).toContain("navigator.share");
    expect(component).toContain("navigator.clipboard.writeText");
    expect(component).toContain("appShareNotice");
  });
});
