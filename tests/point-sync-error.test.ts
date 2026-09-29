import { describe, expect, it } from "vitest";
import { classifyPointSyncError } from "../lib/offline/sync-error";

describe("point action sync errors", () => {
  it("shows database validation errors immediately instead of leaving an impossible action queued", () => {
    expect(classifyPointSyncError({ code: "22023", message: "Active timer limit of 30 minutes reached" })).toEqual({
      status: "rejected",
      reason: "Active timer limit of 30 minutes reached",
    });
  });

  it("keeps network failures queued for a later retry", () => {
    expect(classifyPointSyncError({ message: "Failed to fetch" })).toEqual({ status: "queued", reason: "Failed to fetch" });
  });
});
