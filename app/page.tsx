import { redirect } from "next/navigation";
import { PointsWorkspace } from "@/app/components/points-workspace";
import { Card } from "@/app/components/ui/card";
import { getCurrentLocalDate, getResetPointSummary, getWeekStart, getWeeklyPointSummary, shiftWeek } from "@/lib/points/validation";
import { hasSupabaseConfig } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

type HomePageProps = {
  searchParams: Promise<{ child?: string; error?: string; manage?: string; message?: string; week?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  if (!hasSupabaseConfig()) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-xl items-center px-5 py-10">
        <Card className="p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">SmartPoints foundation</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Connect Supabase to continue</h1>
          <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            Copy <code>.env.example</code> to <code>.env.local</code> and add the project URL and publishable key. Do not add a service-role key.
          </p>
        </Card>
      </main>
    );
  }

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();

  if (!claims) {
    redirect("/sign-in");
  }

  const [{ data: children, error: childrenError }, { data: settings }] = await Promise.all([
    supabase
      .from("children")
      .select("id, display_name, parent_id")
      .is("archived_at", null)
      .order("created_at", { ascending: true }),
    supabase.from("parent_settings").select("id, time_zone"),
  ]);

  if (childrenError) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-xl items-center px-5 py-10">
        <Card className="p-6 sm:p-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">SmartPoints is getting ready</h1>
          <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">Child profiles are not available yet. Apply the latest database migration and try again.</p>
        </Card>
      </main>
    );
  }

  const { child: selectedChildId, error, manage, message, week } = await searchParams;
  const activeChildren = children ?? [];
  const selectedChild = activeChildren.find((child) => child.id === selectedChildId) ?? activeChildren[0] ?? null;
  const timeZone = settings?.find((setting) => setting.id === selectedChild?.parent_id)?.time_zone ?? "UTC";
  const currentDate = getCurrentLocalDate(timeZone);
  const currentWeekStart = getWeekStart(currentDate);
  const viewedWeekStart = week && /^\d{4}-\d{2}-\d{2}$/.test(week) && getWeekStart(week) === week ? week : currentWeekStart;
  const [{ data: tasks }, { data: rewards }, { data: dailyTaskSelections }, { data: pointResets }] = selectedChild ? await Promise.all([
    supabase.from("tasks").select("id, name, points, icon").eq("child_id", selectedChild.id).eq("is_active", true).order("created_at"),
    supabase.from("rewards").select("id, name, cost, icon").eq("child_id", selectedChild.id).eq("is_active", true).order("created_at"),
    supabase.from("daily_task_selections").select("task_id").eq("child_id", selectedChild.id),
    supabase.from("weekly_point_resets").select("week_start, remaining_points, received_points, redeemed_points, reset_at").eq("child_id", selectedChild.id).order("reset_at", { ascending: false }).limit(1),
  ]) : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }];
  const latestReset = pointResets?.[0] ?? null;
  let recentActivityQuery = supabase.from("point_events").select("id, event_type, point_delta, effective_date, task_id, reward_id, reversal_of, created_at").eq("child_id", selectedChild?.id ?? "").gte("effective_date", viewedWeekStart).lt("effective_date", shiftWeek(viewedWeekStart, 1)).order("created_at", { ascending: false }).limit(100);
  if (latestReset) recentActivityQuery = recentActivityQuery.gt("created_at", latestReset.reset_at);
  const [{ data: events }, { data: pointSummaryEvents }] = selectedChild ? await Promise.all([
    recentActivityQuery,
    supabase.from("point_events").select("effective_date, event_type, point_delta, created_at").eq("child_id", selectedChild.id),
  ]) : [{ data: [] }, { data: [] }];
  const taskCatalog = tasks ?? [];
  const dailyTaskIds = new Set((dailyTaskSelections ?? []).map((plan) => plan.task_id));
  const dailyTasks = taskCatalog.filter((task) => dailyTaskIds.has(task.id));
  const pointSummary = latestReset ? getResetPointSummary(pointSummaryEvents ?? [], currentWeekStart, latestReset) : getWeeklyPointSummary(pointSummaryEvents ?? [], currentWeekStart);

  return (
    <>
      {error ? <p className="mx-auto mt-4 w-full max-w-5xl rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">{error}</p> : null}
      {selectedChild ? <PointsWorkspace childId={selectedChild.id} childName={selectedChild.display_name} childProfiles={activeChildren} currentDate={currentDate} currentWeekStart={viewedWeekStart} initialManager={manage === "tasks" || manage === "rewards" ? manage : undefined} initialNotice={message} isCurrentWeek={viewedWeekStart === currentWeekStart} key={`${selectedChild.id}:${manage ?? "dashboard"}`} parentId={claims.claims.sub} pointSummary={pointSummary} taskCatalog={taskCatalog} tasks={dailyTasks} rewards={rewards ?? []} events={events ?? []} timeZone={timeZone} /> : null}
    </>
  );
}
