import { describe, expect, it } from "vitest";
import { getCurrentLocalDate, isTaskIcon, normalizePointValue, normalizeTitle } from "../lib/points/validation";

describe("points workspace validation", () => {
  it("trims task and reward titles", () => {
    expect(normalizeTitle("  Put toys away  ", "Task")).toBe("Put toys away");
  });

  it("accepts positive whole-number point values only", () => {
    expect(normalizePointValue("5", "Points")).toBe(5);
    expect(() => normalizePointValue("0", "Points")).toThrow("positive whole number");
    expect(() => normalizePointValue("2.5", "Points")).toThrow("positive whole number");
  });

  it("derives the current calendar date in the household time zone", () => {
    expect(getCurrentLocalDate("Pacific/Kiritimati", new Date("2026-08-01T12:00:00.000Z"))).toBe("2026-08-02");
  });

  it("accepts only the curated task icon names", () => {
    expect(isTaskIcon("Sparkles")).toBe(true);
    expect(isTaskIcon("Backpack")).toBe(true);
    expect(isTaskIcon("Dog")).toBe(true);
    expect(isTaskIcon("Music2")).toBe(true);
    expect(isTaskIcon("Trophy")).toBe(true);
    expect(isTaskIcon("WashingMachine")).toBe(true);
    expect(isTaskIcon("arbitrary-icon")).toBe(false);
  });
});
