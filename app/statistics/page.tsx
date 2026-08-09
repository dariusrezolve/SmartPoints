import Link from "next/link";
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Gift, TrendingUp } from "lucide-react";
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
  const received = new Map<string, number>();
  const redeemed = new Map<string, number>();
  for (const event of events ?? []) {
    if (event.event_type === "task_completion") received.set(event.task_id ?? "Other", (received.get(event.task_id ?? "Other") ?? 0) + event.point_delta);
    if (event.event_type === "reward_redemption") redeemed.set(event.reward_id ?? "Other", (redeemed.get(event.reward_id ?? "Other") ?? 0) + Math.abs(event.point_delta));
  }

  const renderRows = (items: Map<string, number>, empty: string, kind: "received" | "redeemed") => items.size ? (
    <ul className="mt-4 grid gap-2.5">
      {[...items.entries()].sort((a, b) => b[1] - a[1]).map(([id, points]) => (
        <li className={kind === "received" ? "flex items-center justify-between rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50/60 px-4 py-3" : "flex items-center justify-between rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50/60 px-4 py-3"} key={id}>
          <span className="font-semibold text-slate-800">{names.get(id) ?? "Other"}</span>
          <strong className={kind === "received" ? "text-emerald-700" : "text-amber-700"}>{kind === "received" ? "+" : "−"}{points}</strong>
        </li>
      ))}
    </ul>
  ) : <p className="mt-4 text-sm text-slate-500">{empty}</p>;

  return (
    <main className="workspace-page mx-auto w-full max-w-2xl px-5 pb-10 pt-6">
      <Link className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 transition hover:text-emerald-950" href={`/?child=${child.id}&week=${weekStart}`}><ArrowLeft aria-hidden="true" size={16}/>Back to points</Link>
      <header className="relative mt-5 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 p-6 text-white shadow-xl shadow-emerald-900/15 sm:p-8">
        <div className="absolute -right-12 -top-12 size-40 rounded-full border-[28px] border-white/10"/>
        <p className="relative text-xs font-bold uppercase tracking-[.18em] text-emerald-100">Week of {weekStart}</p>
        <h1 className="relative mt-2 text-3xl font-extrabold tracking-tight">{child.display_name}&apos;s statistics</h1>
        <p className="relative mt-2 max-w-md text-sm text-emerald-50/90">A quick view of where points came from and how they were enjoyed.</p>
      </header>
      <nav aria-label="Week navigation" className="mt-4 flex flex-wrap items-center gap-2">
        <Link className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-white/80 px-3 py-2 text-sm font-semibold text-emerald-800 shadow-sm" href={`/statistics?child=${child.id}&week=${shiftWeek(weekStart, -1)}`}><ChevronLeft aria-hidden="true" size={16}/>Previous week</Link>
        <Link className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-white/80 px-3 py-2 text-sm font-semibold text-emerald-800 shadow-sm" href={`/statistics?child=${child.id}&week=${shiftWeek(weekStart, 1)}`}>Next week<ChevronRight aria-hidden="true" size={16}/></Link>
        {weekStart !== currentWeek ? <Link className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-2 text-sm font-semibold text-white shadow-sm" href={`/statistics?child=${child.id}`}><CalendarDays aria-hidden="true" size={15}/>Current week</Link> : null}
      </nav>
      <section className="mt-5 grid gap-4 sm:grid-cols-2">
        <Card className="p-5"><span className="grid size-10 place-items-center rounded-xl bg-emerald-100 text-emerald-700"><TrendingUp aria-hidden="true" size={21}/></span><h2 className="mt-4 text-lg font-bold tracking-tight">Points received</h2>{renderRows(received, "No points received this week.", "received")}</Card>
        <Card className="p-5"><span className="grid size-10 place-items-center rounded-xl bg-amber-100 text-amber-700"><Gift aria-hidden="true" size={21}/></span><h2 className="mt-4 text-lg font-bold tracking-tight">Points redeemed</h2>{renderRows(redeemed, "No rewards redeemed this week.", "redeemed")}</Card>
      </section>
    </main>
  );
}
