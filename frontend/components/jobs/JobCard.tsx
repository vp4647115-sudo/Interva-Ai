"use client";

import { Bookmark, Briefcase, Building2, Clock, MapPin, Wallet } from "lucide-react";
import { formatSalary, timeAgo, type Job } from "@/services/jobs";

const SAVED_KEY = "intervai-saved-jobs";

function readSaved(): Job[] {
  try { return JSON.parse(window.localStorage.getItem(SAVED_KEY) ?? "[]"); } catch { return []; }
}

export default function JobCard({ job, onOpen }: { job: Job; onOpen: (job: Job) => void }) {
  const salary = formatSalary(job);
  const posted = timeAgo(job.postedAt);
  const initials = (job.company ?? "?").slice(0, 2).toUpperCase();
  const saved = typeof window !== "undefined" && readSaved().some((j) => j.id === job.id);

  const toggleSave = () => {
    const current = readSaved();
    const next = current.some((j) => j.id === job.id)
      ? current.filter((j) => j.id !== job.id)
      : [job, ...current].slice(0, 100);
    window.localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("saved-jobs-changed"));
  };

  return (
    <article className="group rounded-card border border-border bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-modal">
      <div className="flex items-start gap-4">
        {job.companyLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={job.companyLogo} alt="" className="h-12 w-12 shrink-0 rounded-xl border border-border object-contain p-1" loading="lazy" />
        ) : (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-sm font-extrabold text-primary">{initials}</span>
        )}
        <div className="min-w-0 flex-1">
          <button type="button" onClick={() => onOpen(job)} className="text-left">
            <h3 className="truncate font-extrabold text-ink-primary group-hover:text-primary">{job.title}</h3>
          </button>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-ink-secondary">
            <Building2 className="h-3.5 w-3.5 shrink-0" /> {job.company ?? "Company not listed"}
          </p>
        </div>
        {job.workplaceType && (
          <span className="hidden shrink-0 rounded-pill bg-success-soft px-3 py-1 text-xs font-bold text-success sm:block">{job.workplaceType}</span>
        )}
        <button
          type="button"
          onClick={toggleSave}
          title={saved ? "Remove from saved" : "Save job"}
          aria-label={saved ? "Remove from saved jobs" : "Save job"}
          className={`shrink-0 rounded-lg p-1.5 transition ${saved ? "text-primary" : "text-ink-muted hover:bg-primary-soft hover:text-primary"}`}
        >
          <Bookmark className="h-4 w-4" fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-secondary">
        {job.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>}
        {salary && <span className="flex items-center gap-1 font-semibold text-ink-primary"><Wallet className="h-3.5 w-3.5" /> {salary}</span>}
        {job.employmentType && <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {job.employmentType}</span>}
        {posted && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {posted}</span>}
      </div>

      {job.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.skills.slice(0, 5).map((skill) => (
            <span key={skill} className="rounded-pill bg-surface-alt px-2.5 py-1 text-[11px] font-bold text-ink-secondary">{skill}</span>
          ))}
        </div>
      )}

      {job.description && (
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-ink-secondary">{job.description}</p>
      )}

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
        <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">via {job.source}</span>
        <div className="flex gap-2">
          <button type="button" onClick={() => onOpen(job)} className="rounded-pill border border-border px-4 py-2 text-xs font-extrabold text-ink-secondary transition hover:border-primary hover:text-primary">View Job</button>
          <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="rounded-pill bg-primary px-4 py-2 text-xs font-extrabold text-white transition hover:bg-primary-hover">Apply Now</a>
        </div>
      </div>
    </article>
  );
}
