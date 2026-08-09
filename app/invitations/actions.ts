"use server";

import { createHash, randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createInvitation(formData: FormData) {
  const childId = String(formData.get("childId") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!childId || !/^\S+@\S+\.\S+$/.test(email)) throw new Error("Enter a valid email address.");
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims.sub) throw new Error("Sign in before sharing access.");
  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const { error } = await supabase.from("child_parent_invitations").insert({ child_id: childId, invited_email: email, token_hash: tokenHash, expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), created_by: claims.claims.sub });
  if (error) throw new Error("Unable to create invitation.");
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  return `${host ? `${protocol}://${host}` : "http://localhost:3000"}/invite/${token}`;
}

export async function acceptInvitation(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("accept_child_parent_invitation", { p_token: token });
  if (error || !data) redirect(`/invite/${token}?error=${encodeURIComponent("This invitation is invalid, expired, or for a different email address.")}`);
  redirect(`/?child=${data}`);
}
