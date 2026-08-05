import { describe, expect, it } from "vitest";
import { normalizeChildName, resolveHouseholdTimeZone } from "../lib/children/validation";

describe("child profile validation", () => {
  it("trims a valid child display name", () => {
    expect(normalizeChildName("  Mara  ")).toBe("Mara");
  });

  it("rejects blank and oversized child display names", () => {
    expect(() => normalizeChildName("   ")).toThrow("between 1 and 80 characters");
    expect(() => normalizeChildName("a".repeat(81))).toThrow("between 1 and 80 characters");
  });

  it("keeps a valid IANA time zone and falls back to UTC", () => {
    expect(resolveHouseholdTimeZone("Europe/Bucharest")).toBe("Europe/Bucharest");
    expect(resolveHouseholdTimeZone("not-a-time-zone")).toBe("UTC");
    expect(resolveHouseholdTimeZone(undefined)).toBe("UTC");
  });
});
