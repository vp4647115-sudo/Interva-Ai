"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { apiClient, WizardState } from "@/services/api";
import { firebaseAuth } from "@/lib/firebase/auth";
import { Skeleton } from "@/components/ui/States";

/**
 * Gate that redirects to onboarding when the signed-in user has not finished
 * the first-time wizard. Wrap any authenticated page that requires a profile.
 */
export default function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) {
        if (!cancelled) router.replace("/auth/login");
        return;
      }
      try {
        const wizard: WizardState = await apiClient.getWizardState();
        if (!cancelled && !wizard.finished) {
          router.replace("/onboarding");
          return;
        }
        if (!cancelled) setChecked(true);
      } catch {
        // Backend unreachable or token verification failed — send to login.
        if (!cancelled) router.replace("/auth/login");
      }
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, [router]);

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
