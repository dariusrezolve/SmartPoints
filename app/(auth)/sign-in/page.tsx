import { AuthForm, AuthLinks } from "../auth-form";
import { signIn } from "../../auth/actions";

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string; next?: string }> }) {
  const { error, message, next } = await searchParams;
  return <AuthForm action={signIn} error={error} footer={<AuthLinks />} message={message} next={next} submitLabel="Sign in" />;
}
