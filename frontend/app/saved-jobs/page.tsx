"use client";

import { useCallback, useEffect, useState } from "react";
import { BookmarkX, Search } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import JobCard from "@/components/jobs/JobCard";
import JobDetails from "@/components/jobs/JobDetails";
import { EmptyJobs } from "@/components/jobs/JobStates";
import type { Job } from "@/services/jobs";

const STORE_KEY = "intervai-saved-jobs";

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selected, setSelected] = useState<Job | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try { setJobs(JSON.parse(window.localStorage.getItem(STORE_KEY) ?? "[]")); } catch { /* fresh */ }
    setReady(true);
  }, []);

  const unsave = useCallback((id: string) => {
    setJobs((prev) => {
      const next = prev.filter((j) => j.id !== id);
      window.localStorage.setItem(STORE_KEY, JSON.stringify(next));
      return next;
    });
    setSelected((s) => (s?.id === id ? null : s));
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden shrink-0 md:block"><Sidebar /></div>
      <main className="min-w-0 flex-1 bg-[#fbfbfe]">
        <header className="border-b border-border bg-white px-5 py-6 sm:px-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-primary">Saved Jobs</h1>
          <p className="mt-2 text-sm text-ink-secondary">Jobs you bookmarked from your search results.</p>
        </header>
        <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8">
          {!ready ? null : jobs.length === 0 ? (
            <EmptyJobs message="No saved jobs yet" hint="Search for jobs and use the bookmark action to save them here." />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {jobs.map((job) => (
                <div key={job.id} className="relative">
                  <JobCard job={job} onOpen={setSelected} />
                  <button onClick={() => unsave(job.id)} title="Remove from saved" aria-label={`Remove ${job.title}`} className="absolute right-4 top-4 rounded-lg p-1.5 text-ink-muted transition hover:bg-error-soft hover:text-error">
                    <BookmarkX className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {jobs.length === 0 && ready && (
            <a href="/jobs" className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-pill bg-primary px-5 py-2.5 text-sm font-extrabold text-white"><Search className="h-4 w-4" /> Browse jobs</a>
          )}
        </div>
      </main>
      {selected && <JobDetails job={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
