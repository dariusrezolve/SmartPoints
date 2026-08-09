import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { offlineSnapshotKey } from "../lib/offline/storage";

describe("offline snapshot storage", () => {
  it("scopes a snapshot to its authenticated parent and selected child", () => {
    expect(offlineSnapshotKey("parent-1", "child-2")).toBe("parent-1:child-2");
  });

  it("clears pre-MVP snapshots and queued actions when the offline database upgrades", async () => {
    const storage = await readFile(new URL("../lib/offline/storage.ts", import.meta.url), "utf8");

    expect(storage).toContain("const databaseVersion = 3");
    expect(storage).toContain("if (event.oldVersion > 0 && event.oldVersion < databaseVersion)");
    expect(storage).toContain("transaction.objectStore(storeName).clear()");
    expect(storage).toContain("transaction.objectStore(actionStoreName).clear()");
  });
});
