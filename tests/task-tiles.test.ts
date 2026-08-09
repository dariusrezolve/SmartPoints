import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("daily task tiles", () => {
  it("renders an icon and an explicit hover/focus description", async () => {
    const component = await readFile(new URL("../app/components/points-workspace.tsx", import.meta.url), "utf8");

    expect(component).toContain("<TaskIcon");
    expect(component).toContain('role="tooltip"');
    expect(component).toContain("lastTappedTaskId");
    expect(component).toContain("task-tile-pulse");
    expect(component).toContain("Points added: +");
    expect(component).toContain("Current week");
    expect(component).toContain('className="line-clamp-2 text-center text-xs font-semibold leading-snug"');
  });
});
