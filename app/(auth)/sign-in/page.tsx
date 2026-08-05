import { AuthForm, AuthLinks } from "../auth-form";
import { signIn } from "../../auth/actions";

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const { error, message } = await searchParams;
  return <AuthForm action={signIn} error={error} footer={<AuthLinks />} message={message} submitLabel="Sign in" />;
}
