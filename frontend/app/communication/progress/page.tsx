"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2, TrendingUp } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import RequireOnboarding from "@/components/auth/RequireOnboarding";
import { Skeleton } from "@/components/ui/States";
import { communicationApi, scoreLabel, type CommProgress } from "@/services/communication";

function ProgressPage() {
  const [data, setData] = useState<CommProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    communicationApi.history().then(setData).catch(() => setError("Could not load your progress."));
  };
  useEffect(load, []);

  const clear = async () => {
    await communicationApi.deleteHistory();
    load();
  };

  const p = data?.progress;

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden shrink-0 md:block"><Sidebar /></div>
      <main className="min-w-0 flex-1 bg-[#fbfbfe]">
        <header className="border-b border-border bg-white px-5 py-6 sm:px-8">
          <div className="mx-auto max-w-5xl">
            <h1 className="text-3xl font-extrabold tracking-tight text-ink-primary">Communication Progress</h1>
            <p className="mt-2 text-sm text-ink-secondary">Your training journey, session by session.</p>
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-5 py-7 sm:px-8">
          {error && <p className="rounded-card bg-error-soft p-4 text-sm text-error" role="alert">{error}</p>}
          {!data && !error && <div className="space-y-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /></div>}

          {data && (
            <>
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="rounded-card bg-ink-primary p-6 text-white shadow-card">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-white/60">Overall score</p>
                  <div className="mt-2 flex items-end gap-2">
                    <span className="text-4xl font-extrabold">{p?.overallScore ?? "—"}</span>
                    {p?.overallScore != null && <span className="mb-1 text-xs text-white/60">{scoreLabel(p.overallScore)}</span>}
                  </div>
                  {p && p.improvement !== 0 && (
                    <p className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-pink-accent">
                      <TrendingUp className="h-3.5 w-3.5" /> {p.improvement > 0 ? "+" : ""}{p.improvement} points
                    </p>
                  )}
                </div>
                {[
                  ["Sessions", p?.sessionCount ?? 0],
                  ["Speaking minutes", p?.totalSpeakingMinutes ?? 0],
                  ["Strongest skill", p?.strongestSkill ? p.strongestSkill.charAt(0).toUpperCase() + p.strongestSkill.slice(1) : "—"],
                ].map(([label, value]) => (
                  <div key={label as string} className="rounded-card border border-border bg-white p-6 shadow-card">
                    <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">{label}</p>
                    <p className="mt-2 truncate text-2xl font-extrabold capitalize text-ink-primary">{value}</p>
                  </div>
                ))}
              </div>

              {p && Object.keys(p.skillAverages).length > 0 && (
                <div className="mt-5 rounded-card border border-border bg-white p-6 shadow-card">
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-ink-secondary">Skill averages</h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {Object.entries(p.skillAverages).map(([k, v]) => (
                      <div key={k}>
                        <div className="flex justify-between text-xs font-bold"><span className="capitalize text-ink-secondary">{k}</span><span>{v}%</span></div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-border/60"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${v}%` }} /></div>
                      </div>
                    ))}
                  </div>
                  {p.weakestSkill && (
                    <p className="mt-5 rounded-card bg-primary-soft/60 p-4 text-sm text-ink-primary">
                      <span className="font-extrabold">Recommended next: </span>practice <span className="font-bold capitalize">{p.weakestSkill}</span> — it&apos;s your lowest-scoring area.
                      <Link href="/communication" className="ml-2 font-extrabold text-primary hover:underline">Start now →</Link>
                    </p>
                  )}
                </div>
              )}

              <div className="mt-5 rounded-card border border-border bg-white p-6 shadow-card">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-ink-secondary">Session history</h2>
                  {data.sessions.length > 0 && (
                    <button onClick={() => void clear()} className="inline-flex items-center gap-1.5 text-xs font-extrabold text-ink-muted hover:text-error"><Trash2 className="h-3.5 w-3.5" /> Delete history</button>
                  )}
                </div>
                {data.sessions.length === 0 ? (
                  <p className="mt-4 text-sm text-ink-secondary">No sessions yet. <Link href="/communication" className="font-extrabold text-primary hover:underline">Start your first practice →</Link></p>
                ) : (
                  <ul className="mt-4 divide-y divide-border">
                    {data.sessions.map((s) => (
                      <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                        <div>
                          <p className="text-sm font-extrabold capitalize text-ink-primary">{s.skill.replace("-", " ")}</p>
                          <p className="text-xs text-ink-muted capitalize">{s.mode} · {Math.max(1, Math.round(s.durationSeconds / 60))} min{s.createdAt ? ` · ${new Date(s.createdAt).toLocaleDateString()}` : ""}</p>
                        </div>
                        {s.overallScore != null && (
                          <span className={`rounded-pill px-3 py-1 text-xs font-extrabold ${s.overallScore >= 70 ? "bg-success-soft text-success" : s.overallScore >= 50 ? "bg-warning-soft text-warning" : "bg-error-soft text-error"}`}>{s.overallScore}/100</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function CommunicationProgressPage() {
  return (
    <RequireOnboarding>
      <ProgressPage />
    </RequireOnboarding>
  );
}
