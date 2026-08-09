import { describe, expect, it } from "vitest";
import { offlineSnapshotKey } from "../lib/offline/storage";

describe("offline snapshot storage", () => {
  it("scopes a snapshot to its authenticated parent and selected child", () => {
    expect(offlineSnapshotKey("parent-1", "child-2")).toBe("parent-1:child-2");
  });
});
