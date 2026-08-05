"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getWeekStart, isTaskIcon, normalizePointValue, normalizeTitle } from "@/lib/points/validation";
import { createClient } from "@/lib/supabase/server";

function value(formData: FormData, name: string): string {
  const item = formData.get(name);
  return typeof item === "string" ? item : "";
}

async function parentId(): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims.sub) redirect("/sign-in");
  return data.claims.sub;
}

function fail(childId: string, message: string): never {
  redirect(`/?child=${encodeURIComponent(childId)}&error=${encodeURIComponent(message)}`);
}

function done(childId: string): never {
  revalidatePath("/");
  redirect(`/?child=${encodeURIComponent(childId)}`);
}

export async function createTask(formData: FormData) {
  const childId = value(formData, "childId");
  await parentId();
  let name: string;
  let points: number;
  const icon = value(formData, "icon") || "CircleCheck";
  try {
    name = normalizeTitle(value(formData, "name"), "Task");
    points = normalizePointValue(value(formData, "points"), "Points");
    if (!isTaskIcon(icon)) throw new Error("Choose a valid task icon.");
  }
  catch (error) { fail(childId, error instanceof Error ? error.message : "Invalid task."); }
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").insert({ child_id: childId, name, points, icon, starter_key: value(formData, "starterKey") || null });
  if (error) fail(childId, "Unable to add task.");
  done(childId);
}

export async function createReward(formData: FormData) {
  const childId = value(formData, "childId");
  await parentId();
  let name: string;
  let cost: number;
  try { name = normalizeTitle(value(formData, "name"), "Reward"); cost = normalizePointValue(value(formData, "cost"), "Reward cost"); }
  catch (error) { fail(childId, error instanceof Error ? error.message : "Invalid reward."); }
  const supabase = await createClient();
  const { error } = await supabase.from("rewards").insert({ child_id: childId, name, cost });
  if (error) fail(childId, "Unable to add reward.");
  done(childId);
}

export async function setWeeklyTasks(formData: FormData) {
  const childId = value(formData, "childId");
  await parentId();
  const weekStart = value(formData, "weekStart");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart) || getWeekStart(weekStart) !== weekStart) {
    fail(childId, "Choose a valid Monday for the weekly task plan.");
  }
  const taskIds = formData.getAll("taskId").filter((entry): entry is string => typeof entry === "string" && entry.length > 0);
  const supabase = await createClient();
  const { error } = await supabase.rpc("replace_weekly_task_plan", { p_child_id: childId, p_week_start: weekStart, p_task_ids: taskIds });
  if (error) fail(childId, error.code === "22023" ? error.message : "Unable to save daily tasks.");
  done(childId);
}

function resetPointValue(formData: FormData, name: string, label: string, minimum: number): number {
  const parsed = Number(value(formData, name));
  if (!Number.isSafeInteger(parsed) || parsed < minimum) throw new Error(`${label} must be a whole number${minimum === 0 ? " of zero or more" : ""}.`);
  return parsed;
}

export async function resetWeeklyPoints(formData: FormData) {
  const childId = value(formData, "childId");
  await parentId();
  if (value(formData, "confirmReset") !== "on") fail(childId, "Confirm the weekly reset before continuing.");
  let remainingPoints: number;
  let receivedPoints: number;
  let redeemedPoints: number;
  try {
    remainingPoints = resetPointValue(formData, "remainingPoints", "Remaining points", Number.MIN_SAFE_INTEGER);
    receivedPoints = resetPointValue(formData, "receivedPoints", "Received points", 0);
    redeemedPoints = resetPointValue(formData, "redeemedPoints", "Redeemed points", 0);
  } catch (error) { fail(childId, error instanceof Error ? error.message : "Invalid reset values."); }
  const supabase = await createClient();
  const { error } = await supabase.rpc("reset_weekly_points", { p_child_id: childId, p_remaining_points: remainingPoints, p_received_points: receivedPoints, p_redeemed_points: redeemedPoints });
  if (error) fail(childId, error.code === "22023" ? error.message : "Unable to reset this week.");
  done(childId);
}

export async function completeTask(formData: FormData) {
  const childId = value(formData, "childId");
  await parentId();
  const supabase = await createClient();
  const { error } = await supabase.rpc("record_task_completion", { p_child_id: childId, p_task_id: value(formData, "taskId"), p_effective_date: value(formData, "effectiveDate") });
  if (error) fail(childId, error.code === "22023" ? error.message : "Unable to record task completion.");
  done(childId);
}

export async function undoTaskCompletion(formData: FormData) {
  const childId = value(formData, "childId");
  await parentId();
  const supabase = await createClient();
  const { error } = await supabase.rpc("undo_task_completion", { p_event_id: value(formData, "eventId") });
  if (error) fail(childId, error.code === "23505" ? "That completion was already undone." : "Unable to undo completion.");
  done(childId);
}

export async function redeemReward(formData: FormData) {
  const childId = value(formData, "childId");
  await parentId();
  const supabase = await createClient();
  const { error } = await supabase.rpc("redeem_reward", { p_child_id: childId, p_reward_id: value(formData, "rewardId") });
  if (error) fail(childId, "Unable to redeem reward.");
  done(childId);
}
