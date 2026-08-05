import { NextResponse } from "next/server";
import { hasSupabaseConfig } from "@/lib/supabase/env";

export function GET() {
  return NextResponse.json({
    status: "ok",
    supabaseConfigured: hasSupabaseConfig(),
  });
}
