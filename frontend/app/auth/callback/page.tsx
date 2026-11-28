"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getRedirectResult, onAuthStateChanged } from "firebase/auth";
import { firebaseAuth, prepareFirebaseAuth } from "@/lib/firebase/auth";
import { apiClient } from "@/services/api";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let routed = false;
    let active = true;
    let unsubscribe = () => {};
    const routeSignedInUser = async () => {
      if (routed) return;
      routed = true;
      try {
        const destination = await apiClient.postLoginDestination();
        void apiClient.sendLoginNotification().catch((err: unknown) => {
          console.error("Could not queue the login notification email.", err);
        });
        if (active) router.replace(destination);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Could not finish signing in.");
        }
      }
    };

    void prepareFirebaseAuth()
      .then(() => {
        if (!active) return null;
        unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
          if (user) void routeSignedInUser();
        });
        return getRedirectResult(firebaseAuth);
      })
      .then((result) => {
        if (result?.user) void routeSignedInUser();
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Google sign-in could not be completed.");
        }
      });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md rounded-card bg-surface p-10 text-center shadow-card">
        <p role={error ? "alert" : "status"} className="text-sm text-ink-secondary">
          {error ?? "Completing sign-in…"}
        </p>
        <Link href="/auth/login" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
          Back to log in
        </Link>
      </div>
    </main>
  );
}
