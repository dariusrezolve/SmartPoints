import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("task and reward manager reopening", () => {
  it("cleans the manager query through Next navigation only when the manager closes", async () => {
    const menu = await readFile(new URL("../app/components/workspace-menu.tsx", import.meta.url), "utf8");

    expect(menu).toContain("useRouter");
    expect(menu).toContain("function closeManager()");
    expect(menu).toContain("router.replace");
    expect(menu).not.toContain("window.history.replaceState");
    expect(menu).toContain('onClose={closeManager} title="Edit tasks"');
    expect(menu).toContain('onClose={closeManager} title="Edit rewards"');
  });
});
