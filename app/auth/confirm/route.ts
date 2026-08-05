import { type NextRequest, NextResponse } from "next/server";
import { hasSupabaseConfig } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";

  if (!hasSupabaseConfig() || !code || !next.startsWith("/")) {
    return NextResponse.redirect(new URL("/sign-in?error=Invalid%20confirmation%20link.", url.origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  const destination = error ? "/sign-in?error=Unable%20to%20confirm%20that%20link." : next;
  return NextResponse.redirect(new URL(destination, url.origin));
}
