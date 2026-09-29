import Link from "next/link";
import { ArrowLeft, BadgeCheck, Star } from "lucide-react";
import { redirect } from "next/navigation";
import { Card } from "@/app/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getStarTrailTheme } from "@/lib/achievements/themes";

export default async function AchievementsPage({ searchParams }: { searchParams: Promise<{ child?: string }> }) {
  const { child: requestedChild } = await searchParams;
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims) redirect("/sign-in");
  const { data: children } = await supabase.from("children").select("id, display_name").is("archived_at", null).order("created_at");
  const child = children?.find((item) => item.id === requestedChild) ?? children?.[0];
  if (!child) redirect("/");
  const { data: awards } = await supabase.from("achievement_awards").select("id, badge_name, milestone_stars, earned_at, theme_key").eq("child_id", child.id).order("earned_at", { ascending: false });
  return <main className="workspace-page mx-auto w-full max-w-3xl px-5 pb-10 pt-6"><Link className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-800" href={`/?child=${child.id}`}><ArrowLeft size={16}/>Back to points</Link><header className="mt-5 rounded-3xl bg-gradient-to-br from-violet-700 via-fuchsia-600 to-amber-500 p-6 text-white shadow-xl"><p className="text-sm font-bold uppercase tracking-[.16em] text-violet-100">Achievement collection</p><h1 className="mt-2 text-3xl font-extrabold">{child.display_name}&apos;s badges</h1><p className="mt-2 text-sm text-white/90">Earn stars from task points every week. Badges stay here forever.</p></header><Card className="mt-5 p-5"><h2 className="text-lg font-extrabold text-slate-950">How the Star Trail works</h2><p className="mt-2 text-sm text-slate-600">Every task point earns a star. Reach 5, 10, 20, and 35 stars to unlock a weekly title and bonus points.</p></Card><section className="mt-5"><h2 className="text-xl font-extrabold text-slate-950">Badges</h2>{awards?.length ? <ol className="mt-3 grid gap-3 sm:grid-cols-2">{awards.map((award) => <li className={`rounded-2xl border p-4 ${award.theme_key === "hogwarts_adventure" ? "border-indigo-200 bg-gradient-to-br from-indigo-50 to-amber-50" : award.theme_key === "middle_earth" ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-amber-50" : "border-violet-100 bg-gradient-to-br from-violet-50 to-amber-50"}`} key={award.id}><BadgeCheck className={award.theme_key === "hogwarts_adventure" ? "text-indigo-700" : award.theme_key === "middle_earth" ? "text-emerald-700" : "text-violet-600"} size={24}/><strong className="mt-3 block text-slate-950">{award.badge_name}</strong><small className="mt-1 block font-semibold text-slate-600">{getStarTrailTheme(award.theme_key).name}</small><small className="mt-1 block text-slate-600"><Star className="inline" size={13}/> {award.milestone_stars} stars · {new Date(award.earned_at).toLocaleDateString()}</small></li>)}</ol> : <Card className="mt-3 p-5 text-sm text-slate-600">Complete tasks to earn your first permanent badge.</Card>}</section></main>;
}
