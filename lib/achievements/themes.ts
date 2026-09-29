export const starTrailThemes = [
  { key: "magic_kingdom", name: "Magic Kingdom", starter: "Spark Scout", intro: "Your next little adventure is waiting.", pouch: "Your star pouch", path: "Quest path", encouragement: "Complete any task to fill your pouch.", complete: "You are the kingdom's brightest hero.", milestones: [{ stars: 5, bonus: 2, name: "Rainbow Knight" }, { stars: 10, bonus: 3, name: "Unicorn Guardian" }, { stars: 20, bonus: 5, name: "Dragon Friend" }, { stars: 35, bonus: 8, name: "Star Champion" }] },
  { key: "hogwarts_adventure", name: "Hogwarts Adventure", starter: "First-Year Explorer", intro: "Your magic grows with every good deed.", pouch: "Your spellbound stars", path: "Wand-spark trail", encouragement: "Every task adds a little more magic.", complete: "The whole castle cheers for you!", milestones: [{ stars: 5, bonus: 2, name: "House Star" }, { stars: 10, bonus: 3, name: "Spell Scholar" }, { stars: 20, bonus: 5, name: "Phoenix Friend" }, { stars: 35, bonus: 8, name: "Hogwarts Champion" }] },
  { key: "middle_earth", name: "Middle-earth Journey", starter: "Shire Wanderer", intro: "Great journeys begin with little steps.", pouch: "Stars for the road", path: "Journey path", encouragement: "Every task carries you onward.", complete: "Your light shines across the land!", milestones: [{ stars: 5, bonus: 2, name: "Rivendell Scout" }, { stars: 10, bonus: 3, name: "Fellowship Friend" }, { stars: 20, bonus: 5, name: "Mithril Guardian" }, { stars: 35, bonus: 8, name: "Light of the West" }] },
] as const;

export type StarTrailThemeKey = (typeof starTrailThemes)[number]["key"];
export function getStarTrailTheme(key: string | null | undefined) {
  return starTrailThemes.find((theme) => theme.key === key) ?? starTrailThemes[0];
}
export function isStarTrailThemeKey(key: string): key is StarTrailThemeKey {
  return starTrailThemes.some((theme) => theme.key === key);
}
export function getStarTrailProgress(key: string | null | undefined, stars: number) {
  const theme = getStarTrailTheme(key);
  return {
    stars,
    title: [...theme.milestones].reverse().find((milestone) => stars >= milestone.stars)?.name ?? theme.starter,
    nextStars: theme.milestones.find((milestone) => stars < milestone.stars)?.stars ?? null,
  };
}
