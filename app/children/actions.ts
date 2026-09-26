"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { normalizeChildName, resolveHouseholdTimeZone } from "@/lib/children/validation";
import { createClient } from "@/lib/supabase/server";

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
