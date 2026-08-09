import Link from "next/link";
import { acceptInvitation } from "@/app/invitations/actions";
import { signIn, signUp } from "@/app/auth/actions";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { createClient } from "@/lib/supabase/server";

export default async function InvitePage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ error?: string }> }) {
  const { token } = await params; const { error } = await searchParams; const supabase = await createClient(); const { data } = await supabase.auth.getClaims();
  if (data?.claims.sub) return <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-5 py-10"><Card className="w-full p-6"><h1 className="text-2xl font-bold">Join this family</h1>{error ? <p className="mt-4 text-rose-700">{error}</p> : null}<form action={acceptInvitation} className="mt-5"><input name="token" type="hidden" value={token}/><Button type="submit">Accept invitation</Button></form></Card></main>;
  return <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-5 py-10"><Card className="relative w-full overflow-hidden p-6"><div className="absolute -right-12 -top-12 size-32 rounded-full bg-emerald-200/50 blur-2xl"/><p className="relative text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Family invitation</p><h1 className="relative mt-2 text-2xl font-extrabold tracking-tight">Join a SmartPoints family</h1><p className="relative mt-2 text-sm text-slate-600">Create an account with the invited email, then reopen this link to accept.</p>{error ? <p className="mt-4 text-rose-700">{error}</p> : null}<form action={signUp} className="relative mt-5 grid gap-3"><input name="next" type="hidden" value={`/invite/${token}`}/><label>Email<Input name="email" required type="email"/></label><label>Password<Input minLength={8} name="password" required type="password"/></label><Button type="submit">Create account</Button></form><p className="relative mt-5 text-sm"><Link className="font-semibold text-emerald-700" href={`/sign-in?next=/invite/${token}`}>Already have an account? Sign in</Link></p></Card></main>;
}
