"use client";

export const dynamic = "force-dynamic";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiClient, DashboardStats, UserOut } from "@/services/api";
import { ErrorState, Skeleton } from "@/components/ui/States";
import Sidebar from "@/components/dashboard/Sidebar";
import RequireOnboarding from "@/components/auth/RequireOnboarding";
import { firebaseAuth } from "@/lib/firebase/auth";
import { onAuthStateChanged, type User } from "firebase/auth";

export default function DashboardPage() {
  return (
    <RequireOnboarding>
      <DashboardContent />
    </RequireOnboarding>
  );
}

function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [profile, setProfile] = useState<UserOut | null>(null);
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
      const [s, me] = await Promise.all([apiClient.getDashboard(), apiClient.me()]);
      setStats(s);
      setProfile(me);
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
        <section className="min-h-[calc(100vh-106px)] bg-white px-8 py-10">
          {/* Profile summary — saved during onboarding */}
          <div className="mx-auto max-w-4xl">
            <div className="flex flex-wrap items-center gap-5 rounded-card border border-border bg-surface p-6 shadow-card">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-xl font-extrabold text-primary">
                {(profile?.full_name ?? profile?.email ?? "U").slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-xl font-extrabold text-ink-primary">{profile?.full_name ?? "Welcome"}</h2>
                <p className="truncate text-sm text-ink-secondary">{profile?.email}</p>
                {!profile?.email_verified && (
                  <span className="mt-1 inline-block rounded-pill bg-warning-soft px-2.5 py-0.5 text-[11px] font-bold text-warning">Email not verified</span>
                )}
              </div>
              <Link href="/profile" className="rounded-pill border border-border px-4 py-2 text-sm font-bold text-ink-secondary hover:border-primary hover:text-primary">Edit profile</Link>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-4">
              <div className="rounded-card border border-border bg-surface p-5 shadow-card">
                <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">Profile completion</p>
                <p className="mt-2 text-3xl font-extrabold text-primary">{stats?.completion_percent ?? 0}%</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-border/60">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${stats?.completion_percent ?? 0}%` }} />
                </div>
              </div>
              {[
                ["Education", stats?.education_count ?? 0],
                ["Experience", stats?.experience_count ?? 0],
                ["Skills", stats?.skill_count ?? 0],
              ].map(([label, value]) => (
                <div key={label as string} className="rounded-card border border-border bg-surface p-5 shadow-card">
                  <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">{label}</p>
                  <p className="mt-2 text-3xl font-extrabold text-ink-primary">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {[
                { href: "/jobs", label: "Search jobs", desc: "Find live openings matched to your profile." },
                { href: "/resume", label: "Build resume", desc: "Generate an AI-optimized resume in minutes." },
                { href: "/mock-interviews", label: "Practice interviews", desc: "Get AI-scored mock interview feedback." },
              ].map((c) => (
                <Link key={c.href} href={c.href} className="rounded-card border border-border bg-surface p-5 shadow-card transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-modal">
                  <p className="font-extrabold text-ink-primary">{c.label}</p>
                  <p className="mt-1.5 text-sm leading-6 text-ink-secondary">{c.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
