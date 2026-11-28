"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { apiClient } from "@/services/api";
import { firebaseAuth } from "@/lib/firebase/auth";
import { ErrorState, Skeleton } from "@/components/ui/States";

/**
 * Gate that redirects to onboarding when the signed-in user has not finished
 * the first-time wizard. Wrap any authenticated page that requires a profile.
 *
 * Uses `onboarding_completed` from /auth/sync (CandidateProfile — the backend
 * source of truth) instead of wizard.finished (OnboardingState), which is a
 * separate field that can fall out of sync.
 */
export default function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) {
        if (!cancelled) router.replace("/auth/login");
        return;
      }
      try {
        const me = await apiClient.sync();
        if (!cancelled && !me.onboarding_completed) {
          router.replace("/onboarding");
          return;
        }
        if (!cancelled) setChecked(true);
      } catch (err) {
        // Keep the signed-in user on a retryable error screen when the API is unavailable.
        if (!cancelled) setError(err instanceof Error ? err.message : "Unable to check onboarding status.");
      }
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, [router]);

  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-md space-y-4 p-8">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
