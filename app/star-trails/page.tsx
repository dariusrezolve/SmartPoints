import Link from "next/link";
import { ArrowLeft, Stars } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { StarTrailSettings } from "@/app/components/star-trail-settings";
import { getStarTrailTheme } from "@/lib/achievements/themes";
import { createClient } from "@/lib/supabase/server";

export default async function StarTrailsPage({ searchParams }: { searchParams: Promise<{ child?: string; saved?: string; error?: string }> }) {
  const { child: requestedChild, saved, error } = await searchParams;
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims) redirect("/sign-in");
  const { data: children } = await supabase.from("children").select("id, display_name").is("archived_at", null).order("created_at");
  const child = requestedChild ? children?.find((item) => item.id === requestedChild) : children?.[0];
  if (!child) notFound();
  const { data: preference } = await supabase.from("child_dashboard_preferences").select("theme_key, show_star_trail").eq("child_id", child.id).maybeSingle();
  return <main className="workspace-page mx-auto w-full max-w-3xl px-4 pb-10 pt-6 sm:px-5"><Link className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800" href={`/?child=${child.id}`}><ArrowLeft size={16}/>Back to points</Link><header className="mt-5 rounded-3xl bg-gradient-to-br from-emerald-700 via-teal-700 to-indigo-800 p-6 text-white shadow-xl"><Stars aria-hidden="true" className="text-amber-200" size={30}/><h1 className="mt-3 text-3xl font-extrabold">Star Trails</h1><p className="mt-2 text-sm text-white/90">Choose the adventure for {child.display_name}. Your stars and badges are safe when you switch.</p></header>{saved === "1" ? <p className="mt-4 rounded-xl bg-emerald-100 px-4 py-3 text-sm font-bold text-emerald-900" role="status">Star Trail saved.</p> : null}{error ? <p className="mt-4 rounded-xl bg-rose-100 px-4 py-3 text-sm font-bold text-rose-900" role="alert">{error}</p> : null}<StarTrailSettings childId={child.id} initialTheme={getStarTrailTheme(preference?.theme_key).key} initialVisible={preference?.show_star_trail ?? true}/></main>;
}
