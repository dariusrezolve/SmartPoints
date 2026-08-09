import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowLeft, ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, Gift, Minus, TrendingUp, WalletCards } from "lucide-react";
import { redirect } from "next/navigation";
import { Card } from "@/app/components/ui/card";
import { getCurrentLocalDate, getWeekStart, shiftWeek } from "@/lib/points/validation";
import { buildWeeklyStatistics, type TrendMetric } from "@/lib/statistics/weekly-trends";
import { createClient } from "@/lib/supabase/server";

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function trendLabel(metric: TrendMetric): string {
  if (metric.percentChange === null) return metric.current === 0 ? "No baseline" : "New this week";
  if (metric.percentChange === 0) return "No change";
  return `${metric.percentChange > 0 ? "+" : ""}${metric.percentChange}%`;
}

function TrendBadge({ metric, tone = "earned" }: { metric: TrendMetric; tone?: "earned" | "spent" }) {
  const Icon = metric.delta > 0 ? ArrowUpRight : metric.delta < 0 ? ArrowDownRight : Minus;
  const colors = tone === "spent"
    ? "bg-amber-100 text-amber-800"
    : metric.delta > 0 ? "bg-emerald-100 text-emerald-800" : metric.delta < 0 ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600";
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${colors}`}><Icon aria-hidden="true" size={14}/>{trendLabel(metric)}</span>;
}

function Sparkline({ current, label, previous }: { current: number[]; label: string; previous: number[] }) {
  const maximum = Math.max(1, ...current, ...previous);
  const points = (values: number[]) => values.map((value, index) => `${4 + index * 22},${42 - (value / maximum) * 36}`).join(" ");
  return <svg aria-label={label} className="h-16 w-full overflow-visible" preserveAspectRatio="none" role="img" viewBox="0 0 140 48">
    <path d="M4 42H136" stroke="currentColor" strokeOpacity=".12" strokeWidth="1"/>
    <polyline fill="none" points={points(previous)} stroke="currentColor" strokeDasharray="4 4" strokeLinecap="round" strokeLinejoin="round" strokeOpacity=".35" strokeWidth="1.5"/>
    <polyline fill="none" points={points(current)} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
  </svg>;
}

function TrendCard({ icon, metric, prefix = "", title, tone = "earned" }: { icon: ReactNode; metric: TrendMetric; prefix?: string; title: string; tone?: "earned" | "spent" }) {
  const valuePrefix = metric.current > 0 ? prefix : "";
  return <Card className="relative overflow-hidden p-4 sm:p-5">
    <div className={tone === "spent" ? "absolute -right-7 -top-7 size-24 rounded-full bg-amber-100/70" : "absolute -right-7 -top-7 size-24 rounded-full bg-emerald-100/70"}/>
    <span className={tone === "spent" ? "relative grid size-9 place-items-center rounded-xl bg-amber-100 text-amber-700" : "relative grid size-9 place-items-center rounded-xl bg-emerald-100 text-emerald-700"}>{icon}</span>
    <p className="relative mt-3 text-xs font-bold uppercase tracking-[.12em] text-slate-500">{title}</p>
    <p className="relative mt-1 text-3xl font-extrabold tracking-tight text-slate-950">{valuePrefix}{metric.current}</p>
    <div className="relative mt-3 flex flex-wrap items-center gap-2"><TrendBadge metric={metric} tone={tone}/><span className="text-xs font-semibold text-slate-500">Last week: {prefix}{metric.previous}</span></div>
  </Card>;
}

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
  const previousWeekStart = shiftWeek(weekStart, -1);
  const weekEnd = shiftWeek(weekStart, 1);
  const [{ data: events }, { data: tasks }, { data: rewards }] = await Promise.all([
    supabase.from("point_events").select("event_type, point_delta, effective_date, task_id, reward_id").eq("child_id", child.id).gte("effective_date", previousWeekStart).lt("effective_date", weekEnd),
    supabase.from("tasks").select("id, name").eq("child_id", child.id),
    supabase.from("rewards").select("id, name").eq("child_id", child.id),
  ]);

  const taskNames = new Map((tasks ?? []).map((item) => [item.id, item.name]));
  const rewardNames = new Map((rewards ?? []).map((item) => [item.id, item.name]));
  const statistics = buildWeeklyStatistics(events ?? [], weekStart);
  const taskTrends = statistics.taskTrends.filter((task) => taskNames.has(task.id));
  const rewardTrends = [...statistics.rewardTrends].sort((a, b) => b.current - a.current || b.previous - a.previous);

  return (
    <main className="workspace-page mx-auto w-full max-w-5xl px-5 pb-10 pt-6">
      <Link className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 transition hover:text-emerald-950" href={`/?child=${child.id}&week=${weekStart}`}><ArrowLeft aria-hidden="true" size={16}/>Back to points</Link>
      <header className="relative mt-5 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 p-6 text-white shadow-xl shadow-emerald-900/15 sm:p-8">
        <div className="absolute -right-12 -top-12 size-40 rounded-full border-[28px] border-white/10"/>
        <p className="relative text-sm font-bold uppercase tracking-[.16em] text-emerald-100">Week of {weekStart}</p>
        <h1 className="relative mt-2 text-3xl font-extrabold tracking-tight">{child.display_name}&apos;s statistics</h1>
        <p className="relative mt-2 max-w-xl text-sm text-emerald-50/90">Compared with last week: see how points were earned, which tasks are growing, and where points were spent.</p>
      </header>
      <nav aria-label="Week navigation" className="mt-4 flex flex-wrap items-center gap-2">
        <Link className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-white/80 px-3 py-2 text-sm font-semibold text-emerald-800 shadow-sm" href={`/statistics?child=${child.id}&week=${shiftWeek(weekStart, -1)}`}><ChevronLeft aria-hidden="true" size={16}/>Previous week</Link>
        <Link className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-white/80 px-3 py-2 text-sm font-semibold text-emerald-800 shadow-sm" href={`/statistics?child=${child.id}&week=${shiftWeek(weekStart, 1)}`}>Next week<ChevronRight aria-hidden="true" size={16}/></Link>
        {weekStart !== currentWeek ? <Link className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-2 text-sm font-semibold text-white shadow-sm" href={`/statistics?child=${child.id}`}><CalendarDays aria-hidden="true" size={15}/>Current week</Link> : null}
      </nav>

      <section aria-labelledby="overall-trends" className="mt-5">
        <div><p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-700">Compared with last week</p><h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-950" id="overall-trends">Overall points trend</h2></div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <TrendCard icon={<TrendingUp aria-hidden="true" size={19}/>} metric={statistics.received} prefix="+" title="Points received"/>
          <TrendCard icon={<Gift aria-hidden="true" size={19}/>} metric={statistics.spent} prefix="−" title="Points redeemed" tone="spent"/>
          <TrendCard icon={<WalletCards aria-hidden="true" size={19}/>} metric={statistics.net} title="Net points change"/>
        </div>
      </section>

      <Card className="mt-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-bold tracking-tight text-slate-950">Daily points earned</h2><p className="mt-1 text-sm text-slate-500">Monday–Sunday comparison.</p></div><div className="flex gap-3 text-xs font-semibold"><span className="flex items-center gap-1.5 text-emerald-700"><span className="size-2.5 rounded-full bg-emerald-600"/>Current week</span><span className="flex items-center gap-1.5 text-slate-500"><span className="w-4 border-t-2 border-dashed border-slate-400"/>Last week</span></div></div>
        <div className="mt-4 text-emerald-600"><Sparkline current={statistics.currentReceivedDaily} label="Daily points earned for the current and previous week" previous={statistics.previousReceivedDaily}/></div>
        <div className="mt-1 grid grid-cols-7 text-center text-[10px] font-bold uppercase tracking-wide text-slate-400">{dayLabels.map((day) => <span key={day}>{day}</span>)}</div>
      </Card>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <div><p className="text-xs font-bold uppercase tracking-[.14em] text-emerald-700">Earned points</p><h2 className="mt-1 text-lg font-extrabold tracking-tight text-slate-950">Task trends</h2><p className="mt-1 text-sm text-slate-500">Ranked by improvement from last week.</p></div>
          {taskTrends.length ? <ol className="mt-5 grid gap-3">{taskTrends.map((task) => <li className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50/80 to-teal-50/40 p-3.5" key={task.id}>
            <div className="flex items-start justify-between gap-3"><div><strong className="text-sm text-slate-900">{taskNames.get(task.id)}</strong><p className="mt-0.5 text-xs font-medium text-slate-500">This week +{task.current} · Last week +{task.previous}</p></div><TrendBadge metric={task}/></div>
            <div className="mt-2 text-emerald-600"><Sparkline current={task.currentDaily} label={`${taskNames.get(task.id) ?? "Task"} points trend`} previous={task.previousDaily}/></div>
          </li>)}</ol> : <p className="mt-5 rounded-xl bg-emerald-50 px-3 py-3 text-sm text-emerald-900">Complete tasks to start seeing week-over-week trends.</p>}
        </Card>

        <Card className="p-5 sm:p-6">
          <div><p className="text-xs font-bold uppercase tracking-[.14em] text-amber-700">Redeemed points</p><h2 className="mt-1 text-lg font-extrabold tracking-tight text-slate-950">Where points were spent</h2><p className="mt-1 text-sm text-slate-500">Share of this week&apos;s spending and change from last week.</p></div>
          {rewardTrends.length ? <ol className="mt-5 grid gap-3">{rewardTrends.map((reward) => <li className="rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50/80 to-orange-50/40 p-3.5" key={reward.id}>
            <div className="flex items-start justify-between gap-3"><div><strong className="text-sm text-slate-900">{rewardNames.get(reward.id) ?? "Archived reward"}</strong><p className="mt-0.5 text-xs font-medium text-slate-500">{reward.current} points · {reward.share}% of this week&apos;s spending</p></div><TrendBadge metric={reward} tone="spent"/></div>
            <div aria-label={`${reward.share}% of points spent on ${rewardNames.get(reward.id) ?? "this reward"}`} className="mt-3 h-2 overflow-hidden rounded-full bg-amber-100" role="img"><div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: `${reward.share}%` }}/></div>
            <p className="mt-2 text-xs font-semibold text-slate-500">Last week: {reward.previous} points</p>
          </li>)}</ol> : <p className="mt-5 rounded-xl bg-amber-50 px-3 py-3 text-sm text-amber-900">Redeem a reward to see how spending is distributed.</p>}
        </Card>
      </section>
    </main>
  );
}
