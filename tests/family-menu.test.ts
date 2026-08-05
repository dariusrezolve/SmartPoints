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
    expect(component).toContain('name="confirmReset"');
    expect(component.indexOf('action="/auth/sign-out"')).toBeLessThan(component.indexOf("</details>"));
    expect(component.indexOf("<WorkspaceModal")).toBeGreaterThan(component.indexOf("</details>"));
  });
});
