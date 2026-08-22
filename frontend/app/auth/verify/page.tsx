"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, sendEmailVerification } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/auth";

export default function VerifyEmailPage() {
  const [state, setState] = useState<"loading" | "unverified" | "verified" | "signed-out">("loading");

  useEffect(() => {
    // Firebase fires this on load and after the user clicks the email link and
    // returns; emailVerified flips once they've verified.
    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) {
        setState("signed-out");
        return;
      }
      await user.reload();
      setState(user.emailVerified ? "verified" : "unverified");
    });
    return unsub;
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="max-w-md rounded-card bg-surface p-10 text-center shadow-card">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-2xl" aria-hidden>
          ✉️
        </div>

        {state === "loading" && <p className="mt-5 text-sm text-ink-secondary">Checking verification…</p>}

        {state === "unverified" && (
          <>
            <h1 className="mt-5 text-2xl font-extrabold">Verify your email</h1>
            <p className="mt-2 text-sm text-ink-secondary">
              We sent a verification link to your inbox. Click it, then come back here.
            </p>
            <button
              onClick={() => firebaseAuth.currentUser && sendEmailVerification(firebaseAuth.currentUser)}
              className="mt-6 rounded-pill border border-primary px-6 py-3 text-sm font-semibold text-primary hover:bg-primary-soft"
            >
              Resend verification email
            </button>
          </>
        )}

        {state === "verified" && (
          <>
            <h1 className="mt-5 text-2xl font-extrabold">Email verified 🎉</h1>
            <Link href="/dashboard" className="mt-6 inline-block rounded-pill bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-hover">
              Go to dashboard
            </Link>
          </>
        )}

        {state === "signed-out" && (
          <>
            <h1 className="mt-5 text-2xl font-extrabold">Check your inbox</h1>
            <p className="mt-2 text-sm text-ink-secondary">
              We sent a verification link to your email. Click it to activate your account, then log in.
            </p>
            <Link href="/auth/login" className="mt-6 inline-block rounded-pill bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-hover">
              Back to log in
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
