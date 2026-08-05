import { AuthForm } from "../auth-form";
import { updatePassword } from "../../auth/actions";

export default async function UpdatePasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <AuthForm action={updatePassword} email={false} error={error} footer="Choose a new password with at least 8 characters." password submitLabel="Update password" />;
}
