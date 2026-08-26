"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getRedirectResult, onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/auth";
import { apiClient } from "@/services/api";

// Handles both popup sign-in (auth state fires) and redirect sign-in
// (getRedirectResult resolves), then routes: first-time users → onboarding,
// returning users → dashboard.
export default function OAuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    let routed = false;
    const route = async () => {
      if (routed) return;
      routed = true;
      router.push(await apiClient.postLoginDestination());
    };
    getRedirectResult(firebaseAuth)
      .then((cred) => {
        if (cred?.user) void route();
      })
      .catch(() => {});
    const unsub = onAuthStateChanged(firebaseAuth, (user) => {
      if (user) void route();
    });
    return unsub;
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md rounded-card bg-surface p-10 text-center shadow-card">
        <p className="text-sm text-ink-secondary">Completing sign-in…</p>
        <Link href="/auth/login" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
          Back to log in
        </Link>
      </div>
    </main>
  );
}
