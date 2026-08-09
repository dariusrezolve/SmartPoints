import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/app/components/ui/card";
import { getCurrentLocalDate, getWeekStart, shiftWeek } from "@/lib/points/validation";
import { createClient } from "@/lib/supabase/server";

export default async function StatisticsPage({ searchParams }: { searchParams: Promise<{ child?: string; week?: string }> }) {
  const { child: requestedChild, week } = await searchParams;
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims) redirect("/sign-in");
  const { data: children } = await supabase.from("children").select("id, display_name, parent_id").is("archived_at", null).order("created_at");
  const child = children?.find((item) => item.id === requestedChild) ?? children?.[0];
  if (!child) return <main className="mx-auto max-w-xl p-6"><Card className="p-5">Create a child profile first.</Card></main>;
  const { data: settings } = await supabase.from("parent_settings").select("id, time_zone");
  const currentWeek = getWeekStart(getCurrentLocalDate(settings?.find((item) => item.id === child.parent_id)?.time_zone ?? "UTC"));
  const weekStart = week && /^\d{4}-\d{2}-\d{2}$/.test(week) && getWeekStart(week) === week ? week : currentWeek;
  const weekEnd = shiftWeek(weekStart, 1);
  const [{ data: events }, { data: tasks }, { data: rewards }] = await Promise.all([
    supabase.from("point_events").select("event_type, point_delta, task_id, reward_id").eq("child_id", child.id).gte("effective_date", weekStart).lt("effective_date", weekEnd),
    supabase.from("tasks").select("id, name").eq("child_id", child.id),
    supabase.from("rewards").select("id, name").eq("child_id", child.id),
  ]);
  const names = new Map([...(tasks ?? []).map((item) => [item.id, item.name] as const), ...(rewards ?? []).map((item) => [item.id, item.name] as const)]);
  const received = new Map<string, number>(); const redeemed = new Map<string, number>();
  for (const event of events ?? []) { if (event.event_type === "task_completion") received.set(event.task_id ?? "Other", (received.get(event.task_id ?? "Other") ?? 0) + event.point_delta); if (event.event_type === "reward_redemption") redeemed.set(event.reward_id ?? "Other", (redeemed.get(event.reward_id ?? "Other") ?? 0) + Math.abs(event.point_delta)); }
  const renderRows = (items: Map<string, number>, empty: string) => items.size ? <ul className="mt-3 grid gap-2">{[...items.entries()].sort((a,b) => b[1]-a[1]).map(([id, points]) => <li className="flex justify-between rounded-xl bg-emerald-50 px-3 py-2" key={id}><span>{names.get(id) ?? "Other"}</span><strong>+{points}</strong></li>)}</ul> : <p className="mt-3 text-sm text-slate-500">{empty}</p>;
  return <main className="workspace-page mx-auto w-full max-w-xl px-5 pb-10 pt-6"><Link className="text-sm font-semibold text-emerald-700" href={`/?child=${child.id}&week=${weekStart}`}>← Back to points</Link><header className="mt-5"><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-600">Week of {weekStart}</p><h1 className="mt-2 text-3xl font-bold">{child.display_name}&apos;s statistics</h1><Link className="mt-4 inline-block rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700" href={`/statistics?child=${child.id}&week=${shiftWeek(weekStart,-1)}`}>← Previous week</Link></header><section className="mt-5 grid gap-4"><Card className="p-5"><h2 className="font-bold">Points received</h2>{renderRows(received, "No points received this week.")}</Card><Card className="p-5"><h2 className="font-bold">Points redeemed</h2>{renderRows(redeemed, "No rewards redeemed this week.")}</Card></section></main>;
}
