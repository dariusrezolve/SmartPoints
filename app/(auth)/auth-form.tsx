import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";

type AuthFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  error?: string;
  message?: string;
  email?: boolean;
  password?: boolean;
  footer: React.ReactNode;
};

export function AuthForm({ action, submitLabel, error, message, email = true, password = true, footer }: AuthFormProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-5 py-10">
      <Card className="w-full p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-600">SmartPoints</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{submitLabel}</h1>
        {error ? <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">{error}</p> : null}
        {message ? <p className="mt-4 rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-800">{message}</p> : null}
        <form action={action} className="mt-6 grid gap-4">
          {email ? (
            <label>
              Email
              <Input autoComplete="email" name="email" required type="email" />
            </label>
          ) : null}
          {password ? (
            <label>
              Password
              <Input autoComplete={submitLabel === "Sign in" ? "current-password" : "new-password"} minLength={8} name="password" required type="password" />
            </label>
          ) : null}
          <Button type="submit">{submitLabel}</Button>
        </form>
        <p className="mt-6 text-sm text-slate-500">{footer}</p>
      </Card>
    </main>
  );
}

export function AuthLinks() {
  return (
    <>
      <Link className="font-semibold text-sky-700 hover:text-sky-900" href="/sign-up">Create an account</Link> · <Link className="font-semibold text-sky-700 hover:text-sky-900" href="/forgot-password">Forgot password?</Link>
    </>
  );
}
