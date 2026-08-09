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
  next?: string;
};

export function AuthForm({ action, submitLabel, error, message, email = true, password = true, footer, next }: AuthFormProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-5 py-10">
      <Card className="relative w-full overflow-hidden p-6 sm:p-8">
        <div className="absolute -right-16 -top-16 size-40 rounded-full bg-gradient-to-br from-emerald-200/70 to-teal-100/20 blur-2xl"/>
        <div className="relative grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-lg font-black text-white shadow-lg shadow-emerald-900/15">S</div>
        <p className="relative mt-5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">SmartPoints</p>
        <h1 className="relative mt-2 text-3xl font-extrabold tracking-tight text-slate-950">{submitLabel}</h1>
        {error ? <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">{error}</p> : null}
        {message ? <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-900">{message}</p> : null}
        <form action={action} className="mt-6 grid gap-4">
          {next ? <input name="next" type="hidden" value={next}/> : null}
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
      <Link className="font-semibold text-emerald-700 hover:text-emerald-900" href="/sign-up">Create an account</Link> · <Link className="font-semibold text-emerald-700 hover:text-emerald-900" href="/forgot-password">Forgot password?</Link>
    </>
  );
}
