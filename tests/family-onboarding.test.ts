import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("family onboarding", () => {
  it("gives a signed-in parent with no child profile a first-child setup path", async () => {
    const home = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
    const setup = await readFile(new URL("../app/components/first-child-setup.tsx", import.meta.url), "utf8");

    expect(home).toContain("FirstChildSetup");
    expect(setup).toContain("Create your family");
    expect(setup).toContain("createChild");
  });

  it("creates a child and its owner membership in one database function", async () => {
    const actions = await readFile(new URL("../app/children/actions.ts", import.meta.url), "utf8");
    const migration = await readFile(
      new URL("../supabase/migrations/202609260001_atomic_child_onboarding.sql", import.meta.url),
      "utf8",
    );

    expect(actions).toContain('rpc("create_child_profile"');
    expect(migration).toContain("create or replace function public.create_child_profile");
    expect(migration).toContain("insert into public.child_parent_memberships");
    expect(migration).toMatch(/select id, parent_id, 'owner'\s+from public\.children/);
    expect(migration).toContain("security definer");
    expect(migration).toContain("set search_path = ''");
  });

  it("offers an opt-in starter catalog for every new child", async () => {
    const setup = await readFile(new URL("../app/components/first-child-setup.tsx", import.meta.url), "utf8");
    const menu = await readFile(new URL("../app/components/workspace-menu.tsx", import.meta.url), "utf8");
    const actions = await readFile(new URL("../app/children/actions.ts", import.meta.url), "utf8");

    expect(setup).toContain('name="useStarterTemplate"');
    expect(menu).toContain('name="useStarterTemplate"');
    expect(actions).toContain("p_use_starter_template");
  });
});
