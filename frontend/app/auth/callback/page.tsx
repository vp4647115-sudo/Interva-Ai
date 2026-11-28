"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/auth";
import { apiClient } from "@/services/api";

// Fallback route: if a signed-in user lands here directly, route them to the
// right place. With signInWithPopup the routing happens in the login page
// immediately after the popup resolves — this page is just a safety net.
export default function OAuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    let routed = false;
    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user && !routed) {
        routed = true;
        router.push(await apiClient.postLoginDestination());
      }
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
