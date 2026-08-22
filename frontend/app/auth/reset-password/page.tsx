"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useState } from "react";
import { FirebaseError } from "firebase/app";

import { AuthCard } from "@/components/ui/AuthCard";
import { AuthTrustPanel } from "@/components/auth/AuthTrustPanel";
import { PillButton } from "@/components/ui/PillButton";
import { resetPassword } from "@/lib/firebase/auth";

const schema = z.object({ email: z.string().email("Enter a valid email") });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(d: FormData) {
    setError(null);
    setBusy(true);
    try {
      await resetPassword(d.email);
      setSent(true);
    } catch (err) {
      setError(err instanceof FirebaseError ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen">
      <div className="flex flex-1 items-center justify-center bg-background p-6">
        <AuthCard>
          <h1 className="text-2xl font-extrabold">Reset your password</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Enter your email and we&apos;ll send you a reset link.
          </p>

          {sent ? (
            <div role="status" className="mt-6 rounded-2xl bg-success-soft p-4 text-sm text-success">
              If that email exists, a reset link has been sent. Check your inbox.
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="text-sm font-semibold">Email</label>
                <input id="email" type="email" autoComplete="email" {...register("email")}
                  className="mt-1 w-full rounded-input border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  aria-invalid={!!errors.email} />
                {errors.email && <p role="alert" className="mt-1 text-xs text-error">{errors.email.message}</p>}
              </div>
              {error && <p role="alert" className="text-sm text-error">{error}</p>}
              <PillButton type="submit" disabled={busy} className="w-full">
                {busy ? "Sending…" : "Send reset link"}
              </PillButton>
            </form>
          )}

          <p className="mt-6 text-center text-sm">
            <Link href="/auth/login" className="font-semibold text-primary hover:underline">Back to log in</Link>
          </p>
        </AuthCard>
      </div>
      <AuthTrustPanel />
    </main>
  );
}
