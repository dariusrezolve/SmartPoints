import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("activity Undo state", () => {
  it("hides reversed entries and labels the remaining task and reward Undo actions", async () => {
    const [workspace, offlineWorkspace, storage] = await Promise.all([
      readFile(new URL("../app/components/points-workspace.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/~offline/page.tsx", import.meta.url), "utf8"),
      readFile(new URL("../lib/offline/storage.ts", import.meta.url), "utf8"),
    ]);

    expect(workspace).toContain("reversedEventIds");
    expect(workspace).toContain("Undo task");
    expect(workspace).toContain("Undo reward");
    expect(offlineWorkspace).toContain("reversedEventIds");
    expect(offlineWorkspace).toContain("Undo task");
    expect(offlineWorkspace).toContain("Undo reward");
    expect(storage).toContain("reversalOf");
  });
});
