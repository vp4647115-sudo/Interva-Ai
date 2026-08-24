"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { formatSalary, timeAgo, type Job } from "@/services/jobs";

export default function JobDetails({ job, onClose }: { job: Job; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const salary = formatSalary(job);
  const posted = timeAgo(job.postedAt);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(job.applyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable — the Apply link remains usable */ }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-primary/40 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose} role="dialog" aria-modal="true" aria-label={job.title}>
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-modal bg-white p-6 shadow-modal sm:rounded-modal sm:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {job.companyLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={job.companyLogo} alt="" className="h-14 w-14 rounded-xl border border-border object-contain p-1" />
            ) : (
              <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-soft font-extrabold text-primary">{(job.company ?? "?").slice(0, 2).toUpperCase()}</span>
            )}
            <div>
              <h2 className="text-xl font-extrabold text-ink-primary">{job.title}</h2>
              <p className="mt-0.5 text-sm text-ink-secondary">{job.company ?? "Company not listed"}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-ink-secondary hover:bg-surface-alt"><X className="h-5 w-5" /></button>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
          {job.location && <div className="rounded-card bg-surface-alt p-3"><dt className="text-xs font-bold text-ink-muted">Location</dt><dd className="mt-0.5 font-semibold">{job.location}</dd></div>}
          {job.workplaceType && <div className="rounded-card bg-surface-alt p-3"><dt className="text-xs font-bold text-ink-muted">Workplace</dt><dd className="mt-0.5 font-semibold">{job.workplaceType}</dd></div>}
          {salary && <div className="rounded-card bg-surface-alt p-3"><dt className="text-xs font-bold text-ink-muted">Salary</dt><dd className="mt-0.5 font-semibold">{salary}</dd></div>}
          {job.employmentType && <div className="rounded-card bg-surface-alt p-3"><dt className="text-xs font-bold text-ink-muted">Type</dt><dd className="mt-0.5 font-semibold">{job.employmentType}</dd></div>}
          {posted && <div className="rounded-card bg-surface-alt p-3"><dt className="text-xs font-bold text-ink-muted">Posted</dt><dd className="mt-0.5 font-semibold">{posted}</dd></div>}
          <div className="rounded-card bg-surface-alt p-3"><dt className="text-xs font-bold text-ink-muted">Source</dt><dd className="mt-0.5 font-semibold capitalize">{job.source}</dd></div>
        </dl>

        {job.skills.length > 0 && (
          <div className="mt-5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-ink-secondary">Skills</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {job.skills.map((s) => <span key={s} className="rounded-pill bg-primary-soft px-3 py-1 text-xs font-bold text-primary">{s}</span>)}
            </div>
          </div>
        )}

        {job.description && (
          <div className="mt-5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-ink-secondary">Job description</h3>
            <p className="mt-2 text-sm leading-7 text-ink-secondary">{job.description}</p>
          </div>
        )}

        <div className="mt-7 flex flex-col gap-2 border-t border-border pt-5 sm:flex-row">
          <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-pill bg-primary py-3 text-center text-sm font-extrabold text-white shadow-[0_3px_0_#4b31d1] hover:bg-primary-hover">Apply Now</a>
          <button onClick={() => void share()} className="rounded-pill border border-border px-5 py-3 text-sm font-extrabold text-ink-secondary hover:border-primary hover:text-primary">{copied ? "Link copied" : "Share Job"}</button>
        </div>
      </div>
    </div>
  );
}
