"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient, WizardState } from "@/services/api";
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
    (async () => {
      try {
        const wizard: WizardState = await apiClient.getWizardState();
        if (!cancelled && !wizard.finished) {
          router.replace("/onboarding");
          return;
        }
        if (!cancelled) setChecked(true);
      } catch {
        // Not signed in or backend unreachable — send to login.
        if (!cancelled) router.replace("/login");
      }
    })();
    return () => { cancelled = true; };
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
