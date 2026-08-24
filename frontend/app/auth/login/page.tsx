"use client";

export const dynamic = "force-dynamic";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FirebaseError } from "firebase/app";

import { AuthCard } from "@/components/ui/AuthCard";
import { AuthTrustPanel } from "@/components/auth/AuthTrustPanel";
import { PillButton } from "@/components/ui/PillButton";
import { loginWithEmail, loginWithGoogle } from "@/lib/firebase/auth";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof schema>;

function friendlyError(err: unknown): string {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "Incorrect email or password.";
      case "auth/too-many-requests":
        return "Too many attempts. Please try again later.";
      case "auth/popup-closed-by-user":
        return "Google sign-in was cancelled.";
      default:
        return err.message;
    }
  }
  return "Something went wrong. Please try again.";
}

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setServerError(null);
    setBusy(true);
    try {
      await loginWithEmail(data.email, data.password);
      router.push("/onboarding");
    } catch (err) {
      setServerError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    setServerError(null);
    setBusy(true);
    try {
      await loginWithGoogle();
      router.push("/onboarding");
    } catch (err) {
      setServerError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen">
      <div className="flex flex-1 items-center justify-center bg-background p-6">
        <AuthCard>
          <h1 className="text-2xl font-extrabold">Welcome back</h1>
          <p className="mt-1 text-sm text-ink-secondary">Log in to continue practicing.</p>

          <button
            type="button"
            onClick={onGoogle}
            disabled={busy}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-pill border border-border bg-white px-6 py-3 text-sm font-semibold hover:bg-surface-alt disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
              <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.3-2.1 3.7-5.1 3.7-8.6z" />
              <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.2 0-6-2.1-6.9-5.1L1.2 17.2C3.2 21.2 7.3 24 12 24z" />
              <path fill="#FBBC05" d="M5.1 14.3a7.4 7.4 0 010-4.6L1.2 6.8a12 12 0 000 10.4l3.9-2.9z" />
              <path fill="#EA4335" d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.3 0 3.2 2.8 1.2 6.8l3.9 2.9C6 6.8 8.8 4.7 12 4.7z" />
            </svg>
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-4 text-xs text-ink-muted">
            <span className="h-px flex-1 bg-border" /> OR <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-semibold">Email</label>
              <input id="email" type="email" autoComplete="email" {...register("email")}
                className="mt-1 w-full rounded-input border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
                aria-invalid={!!errors.email} />
              {errors.email && <p role="alert" className="mt-1 text-xs text-error">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-semibold">Password</label>
              <input id="password" type="password" autoComplete="current-password" {...register("password")}
                className="mt-1 w-full rounded-input border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
                aria-invalid={!!errors.password} />
              {errors.password && <p role="alert" className="mt-1 text-xs text-error">{errors.password.message}</p>}
            </div>

            {serverError && <p role="alert" className="text-sm text-error">{serverError}</p>}

            <PillButton type="submit" disabled={busy} className="w-full">
              {busy ? "Logging in…" : "Log in"}
            </PillButton>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm">
            <Link href="/auth/reset-password" className="text-primary hover:underline">Forgot password?</Link>
            <Link href="/auth/register" className="font-semibold text-primary hover:underline">Create account</Link>
          </div>
        </AuthCard>
      </div>
      <AuthTrustPanel />
    </main>
  );
}
