"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/auth";

// With Firebase popup sign-in there is no redirect callback to process; this
// page just waits for the auth state and forwards to the dashboard.
export default function OAuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, (user) => {
      if (user) router.push("/dashboard");
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
