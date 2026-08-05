import Link from "next/link";
import { AuthForm } from "../auth-form";
import { signUp } from "../../auth/actions";

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <AuthForm action={signUp} error={error} footer={<>Already have an account? <Link href="/sign-in">Sign in</Link></>} submitLabel="Create account" />;
}
