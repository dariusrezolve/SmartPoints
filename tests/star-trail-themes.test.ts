import { describe, expect, it } from "vitest";
import { getStarTrailTheme, getStarTrailProgress, starTrailThemes } from "../lib/achievements/themes";

describe("Star Trail themes", () => {
  it("keeps Magic Kingdom as the safe default", () => {
    expect(getStarTrailTheme(undefined).key).toBe("magic_kingdom");
    expect(getStarTrailTheme("unknown").key).toBe("magic_kingdom");
  });

  it("uses the same milestones and bonuses across three distinct stories", () => {
    expect(starTrailThemes).toHaveLength(3);
    for (const theme of starTrailThemes) {
      expect(theme.milestones.map(({ stars, bonus }) => [stars, bonus])).toEqual([[5, 2], [10, 3], [20, 5], [35, 8]]);
      expect(getStarTrailProgress(theme.key, 10)).toMatchObject({ stars: 10, title: theme.milestones[1].name, nextStars: 20 });
    }
    expect(new Set(starTrailThemes.map((theme) => theme.milestones[1].name)).size).toBe(3);
  });
});
