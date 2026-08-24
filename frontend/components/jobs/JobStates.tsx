"use client";

import { Building2 } from "lucide-react";

export function JobSkeleton() {
  return (
    <div className="rounded-card border border-border bg-white p-5 shadow-card" aria-hidden>
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 animate-pulse rounded-xl bg-border/60" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 animate-pulse rounded bg-border/60" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-border/60" />
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <div className="h-3 w-24 animate-pulse rounded bg-border/60" />
        <div className="h-3 w-20 animate-pulse rounded bg-border/60" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full animate-pulse rounded bg-border/60" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-border/60" />
      </div>
    </div>
  );
}

export function EmptyJobs({ message, hint }: { message: string; hint?: string }) {
  return (
    <div className="rounded-card bg-surface p-12 text-center shadow-card">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft">
        <Building2 className="h-6 w-6 text-primary" />
      </span>
      <h3 className="mt-5 text-lg font-extrabold">{message}</h3>
      {hint && <p className="mx-auto mt-2 max-w-sm text-sm text-ink-secondary">{hint}</p>}
    </div>
  );
}

export function JobsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-card bg-error-soft p-8 text-center">
      <p className="font-extrabold text-error">Unable to load jobs right now.</p>
      <p className="mt-1 text-sm text-ink-secondary">Please try again in a moment.</p>
      <button onClick={onRetry} className="mt-4 rounded-pill border border-error px-5 py-2 text-sm font-extrabold text-error">Try again</button>
    </div>
  );
}
