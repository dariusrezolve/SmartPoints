import Link from "next/link";
import { AuthForm } from "../auth-form";
import { requestPasswordReset } from "../../auth/actions";

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <AuthForm action={requestPasswordReset} error={error} footer={<Link href="/sign-in">Back to sign in</Link>} password={false} submitLabel="Send reset link" />;
}
