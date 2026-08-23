"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiClient, DashboardStats } from "@/services/api";
import { ErrorState, Skeleton } from "@/components/ui/States";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setStats(await apiClient.getDashboard());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) return <ErrorState message={error} onRetry={() => void load()} />;

  if (!stats) {
    return (
      <main className="mx-auto max-w-5xl p-8">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="mt-6 h-40 w-full" />
      </main>
    );
  }

  const cards = [
    { label: "Interviews completed", value: "0", hint: "Coming in Phase 4" },
    { label: "Average score", value: "—", hint: "Complete an interview" },
    { label: "Skills listed", value: String(stats.skill_count), hint: "From your profile" },
  ];

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Your dashboard</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Personalized for you — even with partial data.
          </p>
        </div>
        <Link
          href="/onboarding"
          className="rounded-pill border border-primary px-5 py-2 text-sm font-bold text-primary"
        >
          Edit profile
        </Link>
      </div>

      {/* Profile completion meter */}
      <section className="mt-8 rounded-card bg-surface p-8 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Profile completion</h2>
          <span className="text-2xl font-extrabold text-primary">{stats.completion_percent}%</span>
        </div>
        <div
          className="mt-4 h-3 overflow-hidden rounded-pill bg-border/60"
          role="progressbar"
          aria-valuenow={stats.completion_percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-pill bg-gradient-to-r from-primary to-secondary transition-all duration-500"
            style={{ width: `${stats.completion_percent}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-ink-secondary">
          {stats.completion_percent < 100
            ? "Finish onboarding to unlock better-tailored interviews."
            : "Your profile is complete — nice work!"}
        </p>
      </section>

      {/* Stats cards */}
      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-card bg-surface p-6 shadow-card">
            <p className="text-sm font-semibold text-ink-secondary">{c.label}</p>
            <p className="mt-2 text-3xl font-extrabold">{c.value}</p>
            <p className="mt-1 text-xs text-ink-secondary">{c.hint}</p>
          </div>
        ))}
      </section>

      {/* Weak-skill breakdown + CTA */}
      <section className="mt-6 grid gap-4 md:grid-cols-[2fr_1fr]">
        <div className="rounded-card bg-surface p-8 shadow-card">
          <h2 className="text-lg font-bold">Weak-skill breakdown</h2>
          <p className="mt-2 text-sm text-ink-secondary">
            Once you complete your first interview, your weakest skills will appear here with a
            targeted practice plan.
          </p>
        </div>
        <Link
          href="/interview/new"
          className="flex items-center justify-center rounded-card bg-gradient-to-r from-primary to-secondary p-8 text-center shadow-card transition hover:brightness-110"
        >
          <span className="text-lg font-extrabold text-white">Start New Interview →</span>
        </Link>
      </section>
    </main>
  );
}
