"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  completeGoogleRedirect,
  getCurrentFirebaseUser,
  prepareFirebaseAuth,
} from "@/lib/firebase/auth";
import { apiClient } from "@/services/api";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function finishGoogleSignIn() {
      try {
        await prepareFirebaseAuth();
        const result = await completeGoogleRedirect();
        const user = result?.user ?? await getCurrentFirebaseUser();
        if (!user) {
          if (active) router.replace("/auth/login");
          return;
        }

        if (result?.user) {
          void apiClient.sendLoginNotification().catch((notificationError: unknown) => {
            console.error("Could not queue the login notification email.", notificationError);
          });
        }

        const destination = await apiClient.postLoginDestination();
        if (active) router.replace(destination);
      } catch (redirectError) {
        console.error("[firebase/auth] Google redirect sign-in failed.", redirectError);
        if (active) {
          setError(
            redirectError instanceof Error
              ? redirectError.message
              : "Google sign-in could not be completed. Please try again.",
          );
        }
      }
    }

    void finishGoogleSignIn();
    return () => {
      active = false;
    };
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md rounded-card bg-surface p-10 text-center shadow-card">
        {error ? (
          <>
            <p role="alert" className="text-sm text-error">{error}</p>
            <Link href="/auth/login" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
              Back to log in
            </Link>
          </>
        ) : (
          <p className="text-sm text-ink-secondary">Completing sign-in…</p>
        )}
      </div>
    </main>
  );
}
