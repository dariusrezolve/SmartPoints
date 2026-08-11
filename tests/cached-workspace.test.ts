import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("cached daily workspace", () => {
  it("renders saved tasks, rewards, and undo-capable activity with the existing offline queue", async () => {
    const page = await readFile(new URL("../app/~offline/page.tsx", import.meta.url), "utf8");

    expect(page).toContain("useOfflineActionSync");
    expect(page).toContain("queueCompletion");
    expect(page).toContain("queueReward");
    expect(page).toContain("queueUndo");
    expect(page).toContain("snapshot.events");
  });

  it("keeps the cached workspace visible while it refreshes online", async () => {
    const page = await readFile(new URL("../app/~offline/page.tsx", import.meta.url), "utf8");

    expect(page).toContain("useRouter");
    expect(page).toContain('router.replace("/")');
    expect(page).toContain("navigator.onLine");
  });

  it("opens the authoritative workspace instead of claiming offline when no saved snapshot exists online", async () => {
    const page = await readFile(new URL("../app/~offline/page.tsx", import.meta.url), "utf8");

    expect(page).toContain("Opening SmartPoints");
    expect(page).toContain("snapshot !== null || isOnline !== true");
  });
});
