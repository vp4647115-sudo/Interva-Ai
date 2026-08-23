"use client";

export const dynamic = "force-dynamic";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiClient, DashboardStats } from "@/services/api";
import { ErrorState, Skeleton } from "@/components/ui/States";
import Sidebar from "@/components/dashboard/Sidebar";
import { firebaseAuth } from "@/lib/firebase/auth";
import { onAuthStateChanged, type User } from "firebase/auth";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(firebaseAuth, (user) => {
      setAuthUser(user);
      setAuthReady(true);
    });
  }, []);

  const load = useCallback(async () => {
    if (!authUser) return;
    try {
      setStats(await apiClient.getDashboard());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard.");
    }
  }, [authUser]);

  useEffect(() => {
    if (authReady && authUser) void load();
  }, [authReady, authUser, load]);

  if (error) return <ErrorState message={error} onRetry={() => void load()} />;

  if (!stats && (!authReady || authUser)) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 p-8">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="mt-6 h-40 w-full" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden shrink-0 md:block">
        <Sidebar />
      </div>
      <main className="min-w-0 flex-1 overflow-hidden bg-white">
        <header className="border-b border-border px-8 py-7">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-primary">Auto Apply</h1>
          <p className="mt-2 text-sm text-ink-secondary">
            Automatically apply to jobs matching your profile.
          </p>
        </header>
        <section className="relative min-h-[calc(100vh-106px)] bg-white">
          <div className="mx-auto max-w-4xl px-8 py-14 opacity-35">
            <div className="grid grid-cols-3 gap-4">
              {["Searching", "Applications", "Interview invites"].map((label) => (
                <div key={label} className="rounded-card border border-border p-5">
                  <p className="text-sm font-bold">{label}</p>
                  <p className="mt-6 text-3xl font-extrabold text-primary">0</p>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute inset-0 flex items-start justify-center bg-white/60 px-4 py-8 sm:py-10">
            <div className="w-full max-w-[468px] rounded-modal bg-white px-8 py-9 text-center shadow-modal sm:px-10 sm:py-10">
              <h2 className="mx-auto max-w-[340px] text-4xl font-extrabold leading-[1.15] tracking-tight text-black">
                Your Job Hunt,
                <br />
                Automated
              </h2>
              <p className="mx-auto mt-7 max-w-[365px] text-lg font-medium leading-7 text-ink-secondary">
                Our AI agent searches, matches, and applies to the right jobs for you — around the
                clock. Cut out the guesswork. Skip the burnout. Get more interviews, faster.
              </p>
              <div className="relative mx-auto mt-7 h-[207px] max-w-[366px] overflow-hidden rounded-2xl bg-[#5b5b5d] p-3 shadow-inner">
                <div className="h-full rotate-[-2deg] rounded-lg bg-white p-3 text-left shadow-lg">
                  <div className="flex gap-3">
                    <div className="w-[25%] space-y-2 border-r border-border pr-2">
                      <div className="h-3 w-14 rounded bg-primary/25" />
                      <div className="h-2 rounded bg-border" />
                      <div className="h-2 rounded bg-border" />
                      <div className="h-2 rounded bg-border" />
                      <div className="h-2 rounded bg-border" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div className="h-3 w-20 rounded bg-ink-primary/20" />
                        <div className="h-3 w-12 rounded bg-success/40" />
                      </div>
                      <div className="mt-4 space-y-2">
                        {[1, 2, 3, 4, 5].map((row) => (
                          <div key={row} className="flex items-center gap-2">
                            <div className="h-2 w-16 rounded bg-ink-primary/15" />
                            <div className="h-2 flex-1 rounded bg-border" />
                            <div className="h-2 w-10 rounded bg-success/30" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-lg">
                  <span className="ml-1 h-0 w-0 border-y-[10px] border-l-[16px] border-y-transparent border-l-ink-primary" />
                </span>
              </div>
              <Link
                href="/onboarding"
                className="mt-8 block rounded-pill bg-primary px-6 py-4 text-lg font-extrabold text-white shadow-[0_3px_0_#4b31d1] transition hover:bg-primary-hover"
              >
                Start Auto-Apply
              </Link>
              <div className="mt-9 text-amber-500" aria-label="5 out of 5 stars">
                ★ ★ ★ ★ ★
              </div>
              <blockquote className="mx-auto mt-2 max-w-[330px] text-base font-semibold leading-6 text-ink-primary">
                “I woke up to 6 interview invites in my inbox, all while my AI was working
                overnight. I got my new role in just 20 days.”
              </blockquote>
              <p className="mt-3 text-base font-medium text-ink-secondary">Alice B, Product Manager</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
