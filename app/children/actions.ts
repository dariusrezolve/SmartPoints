"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { normalizeChildName, resolveHouseholdTimeZone } from "@/lib/children/validation";
import { createClient } from "@/lib/supabase/server";
import { isStarTrailThemeKey } from "@/lib/achievements/themes";

async function getAuthenticatedParentId(): Promise<string> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();

  if (!claims?.claims.sub) {
    redirect("/sign-in");
  }

  return claims.claims.sub;
}

function getString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function getTimerMinutes(formData: FormData, name: string, label: string): number {
  const value = Number(getString(formData, name));
  if (!Number.isInteger(value) || value < 1 || value > 1440) throw new Error(`${label} must be a whole number between 1 and 1440 minutes.`);
  return value;
}

export async function createChild(formData: FormData) {
  await getAuthenticatedParentId();
  const supabase = await createClient();
  let displayName: string;

  try {
    displayName = normalizeChildName(getString(formData, "displayName"));
  } catch (error) {
    redirect(`/?error=${encodeURIComponent(error instanceof Error ? error.message : "Invalid child display name.")}`);
  }

  const timeZone = resolveHouseholdTimeZone(getString(formData, "timeZone"));
  const useStarterTemplate = getString(formData, "useStarterTemplate") === "on";
  const { data: childId, error: childError } = await supabase.rpc("create_child_profile", {
    p_display_name: displayName,
    p_time_zone: timeZone,
    p_use_starter_template: useStarterTemplate,
  });

  if (childError || typeof childId !== "string") {
    const message = childError?.code === "23505" ? "An active child already uses that name." : "Unable to create child profile.";
    redirect(`/?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/");
  redirect(`/?child=${childId}`);
}

export async function renameChild(formData: FormData) {
  const parentId = await getAuthenticatedParentId();
  const childId = getString(formData, "childId");
  const supabase = await createClient();
  let displayName: string;

  try {
    displayName = normalizeChildName(getString(formData, "displayName"));
  } catch (error) {
    redirect(`/?child=${encodeURIComponent(childId)}&error=${encodeURIComponent(error instanceof Error ? error.message : "Invalid child display name.")}`);
  }

  const { error } = await supabase
    .from("children")
    .update({ display_name: displayName })
    .eq("id", childId)
    .eq("parent_id", parentId);

  if (error) {
    const message = error.code === "23505" ? "An active child already uses that name." : "Unable to update child profile.";
    redirect(`/?child=${encodeURIComponent(childId)}&error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/");
  redirect(`/?child=${encodeURIComponent(childId)}`);
}

export async function archiveChild(formData: FormData) {
  const parentId = await getAuthenticatedParentId();
  const childId = getString(formData, "childId");
  const supabase = await createClient();
  const { error } = await supabase
    .from("children")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", childId)
    .eq("parent_id", parentId);

  if (error) {
    redirect(`/?child=${encodeURIComponent(childId)}&error=Unable%20to%20archive%20child%20profile.`);
  }

  revalidatePath("/");
  redirect("/");
}

export async function updateHouseholdTimeZone(formData: FormData) {
  const parentId = await getAuthenticatedParentId();
  const supabase = await createClient();
  const timeZone = resolveHouseholdTimeZone(getString(formData, "timeZone"));
  const { error } = await supabase
    .from("parent_settings")
    .update({ time_zone: timeZone })
    .eq("id", parentId);

  if (error) {
    redirect("/?error=Unable%20to%20update%20household%20time%20zone.");
  }

  revalidatePath("/");
  redirect("/");
}

export async function updateChildTimerLimits(formData: FormData) {
  await getAuthenticatedParentId();
  const childId = getString(formData, "childId");
  let maxConcurrentMinutes: number;
  let maxDailyMinutes: number;
  try {
    maxConcurrentMinutes = getTimerMinutes(formData, "maxConcurrentMinutes", "Concurrent timer limit");
    maxDailyMinutes = getTimerMinutes(formData, "maxDailyMinutes", "Daily timer limit");
  } catch (error) {
    redirect(`/?child=${encodeURIComponent(childId)}&error=${encodeURIComponent(error instanceof Error ? error.message : "Invalid timer limit.")}`);
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_child_timer_limits", { p_child_id: childId, p_max_concurrent_minutes: maxConcurrentMinutes!, p_max_daily_minutes: maxDailyMinutes! });
  if (error) redirect(`/?child=${encodeURIComponent(childId)}&error=Unable%20to%20update%20timer%20limits.`);
  revalidatePath("/");
  redirect(`/?child=${encodeURIComponent(childId)}&message=Timer%20limits%20saved.`);
}

export async function updateStarTrailVisibility(formData: FormData) {
  await getAuthenticatedParentId(); const childId = getString(formData, "childId"); const supabase = await createClient();
  const { error } = await supabase.rpc("set_star_trail_visibility", { p_child_id: childId, p_show_star_trail: getString(formData, "showStarTrail") === "on" });
  if (error) redirect(`/?child=${encodeURIComponent(childId)}&error=Unable%20to%20update%20Star%20Trail.`);
  revalidatePath("/"); redirect(`/?child=${encodeURIComponent(childId)}`);
}

export async function updateStarTrailPreferences(formData: FormData) {
  await getAuthenticatedParentId();
  const childId = getString(formData, "childId");
  const themeKey = getString(formData, "themeKey");
  if (!isStarTrailThemeKey(themeKey)) redirect(`/star-trails?child=${encodeURIComponent(childId)}&error=Choose%20a%20valid%20trail.`);
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_star_trail_preferences", {
    p_child_id: childId, p_theme_key: themeKey, p_show_star_trail: getString(formData, "showStarTrail") === "on",
  });
  if (error) redirect(`/star-trails?child=${encodeURIComponent(childId)}&error=Unable%20to%20save%20Star%20Trail.`);
  revalidatePath("/");
  revalidatePath("/star-trails");
  redirect(`/star-trails?child=${encodeURIComponent(childId)}&saved=1`);
}
