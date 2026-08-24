"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import JobCard from "@/components/jobs/JobCard";
import JobDetails from "@/components/jobs/JobDetails";
import { EmptyJobs, JobSkeleton, JobsError } from "@/components/jobs/JobStates";
import { emptyFilters, searchJobs, type Job, type JobSearchFilters } from "@/services/jobs";

const HISTORY_KEY = "intervai-job-search-history";

export default function JobSearchPage() {
  const [filters, setFilters] = useState<JobSearchFilters>(emptyFilters);
  const [submitted, setSubmitted] = useState<JobSearchFilters | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState<Job | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try { setHistory(JSON.parse(window.localStorage.getItem(HISTORY_KEY) ?? "[]")); } catch { /* fresh history */ }
  }, []);

  const runSearch = useCallback(async (f: JobSearchFilters) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const res = await searchJobs(f, controller.signal);
      setJobs(res.jobs);
      setTotal(res.pagination.total);
      setSearched(true);
      if (f.query.trim() && f.page === 1) {
        setHistory((prev) => {
          const next = [f.query.trim(), ...prev.filter((h) => h !== f.query.trim())].slice(0, 5);
          window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
          return next;
        });
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError(e instanceof Error ? e.message : "Unable to load jobs.");
    } finally {
      if (abortRef.current === controller) setLoading(false);
    }
  }, []);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const next = { ...filters, page: 1 };
    setFilters(next);
    setSubmitted(next);
    void runSearch(next);
  };

  const patch = (p: Partial<JobSearchFilters>) => setFilters((f) => ({ ...f, ...p }));

  const goToPage = (page: number) => {
    if (!submitted) return;
    const next = { ...submitted, page };
    setSubmitted(next);
    setFilters(next);
    void runSearch(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setFilters(emptyFilters);
    setSubmitted(null);
    setJobs([]);
    setSearched(false);
    setTotal(0);
  };

  const totalPages = Math.max(1, Math.ceil(total / (submitted?.limit ?? 20)));

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden shrink-0 md:block"><Sidebar /></div>
      <main className="min-w-0 flex-1 bg-[#fbfbfe]">
        <header className="border-b border-border bg-white px-5 py-6 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-3xl font-extrabold tracking-tight text-ink-primary">Job Search</h1>
            <p className="mt-2 text-sm text-ink-secondary">Real-time listings from across the web, updated continuously.</p>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8">
          <form onSubmit={submit} className="rounded-card border border-border bg-white p-5 shadow-card sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                <input
                  value={filters.query}
                  onChange={(e) => patch({ query: e.target.value })}
                  placeholder="Search jobs — try “React Developer”, “Data Analyst”…"
                  className="w-full rounded-input border border-border bg-surface-alt py-3 pl-11 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                  aria-label="Job keyword"
                />
              </div>
              <button type="button" onClick={() => setShowFilters((s) => !s)} className="inline-flex items-center justify-center gap-2 rounded-input border border-border px-4 py-3 text-sm font-extrabold text-ink-secondary hover:border-primary hover:text-primary lg:hidden">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </button>
              <button type="submit" disabled={loading} className="rounded-input bg-primary px-7 py-3 text-sm font-extrabold text-white shadow-[0_3px_0_#4b31d1] transition hover:bg-primary-hover disabled:opacity-50">Search Jobs</button>
            </div>

            <div className={`${showFilters ? "grid" : "hidden lg:grid"} mt-4 gap-3 sm:grid-cols-2 lg:grid-cols-5`}>
              <input value={filters.location} onChange={(e) => patch({ location: e.target.value })} placeholder="Location" aria-label="Location" className="rounded-input border border-border bg-surface-alt px-3.5 py-2.5 text-sm" />
              <select value={filters.remote} onChange={(e) => patch({ remote: e.target.value as JobSearchFilters["remote"] })} aria-label="Workplace type" className="rounded-input border border-border bg-surface-alt px-3 py-2.5 text-sm">
                <option value="">Any workplace</option><option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="on-site">On-site</option>
              </select>
              <select value={filters.experienceLevel} onChange={(e) => patch({ experienceLevel: e.target.value })} aria-label="Experience level" className="rounded-input border border-border bg-surface-alt px-3 py-2.5 text-sm">
                <option value="">Any experience</option><option value="1">Entry level</option><option value="3">Mid level</option><option value="5">Senior</option>
              </select>
              <select value={filters.jobType} onChange={(e) => patch({ jobType: e.target.value })} aria-label="Employment type" className="rounded-input border border-border bg-surface-alt px-3 py-2.5 text-sm">
                <option value="">Any type</option><option value="full_time">Full time</option><option value="part_time">Part time</option><option value="contract">Contract</option><option value="internship">Internship</option>
              </select>
              <input value={filters.company} onChange={(e) => patch({ company: e.target.value })} placeholder="Company" aria-label="Company" className="rounded-input border border-border bg-surface-alt px-3.5 py-2.5 text-sm" />
            </div>

            {(history.length > 0 || searched) && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {history.map((h) => (
                  <button key={h} type="button" onClick={() => { patch({ query: h }); const next = { ...filters, query: h, page: 1 }; setSubmitted(next); void runSearch(next); }} className="rounded-pill bg-surface-alt px-3 py-1.5 text-xs font-bold text-ink-secondary hover:bg-primary-soft hover:text-primary">{h}</button>
                ))}
                {searched && <button type="button" onClick={clearFilters} className="ml-auto inline-flex items-center gap-1 text-xs font-extrabold text-ink-muted hover:text-error"><X className="h-3.5 w-3.5" /> Clear filters</button>}
              </div>
            )}
          </form>

          <div className="mt-6">
            {loading && (
              <div className="grid gap-4 lg:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => <JobSkeleton key={i} />)}
              </div>
            )}

            {!loading && error && <JobsError onRetry={() => submitted && void runSearch(submitted)} />}

            {!loading && !error && searched && jobs.length === 0 && (
              <EmptyJobs message="No jobs found" hint="Try changing your keywords, location, or filters." />
            )}

            {!loading && !error && jobs.length > 0 && (
              <>
                <p className="mb-4 text-sm text-ink-secondary">{total.toLocaleString()} jobs found{submitted?.query ? ` for “${submitted.query}”` : ""}</p>
                <div className="grid gap-4 lg:grid-cols-2">
                  {jobs.map((job) => <JobCard key={job.id} job={job} onOpen={setSelected} />)}
                </div>
                {totalPages > 1 && (
                  <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Pagination">
                    <button onClick={() => goToPage((submitted?.page ?? 1) - 1)} disabled={(submitted?.page ?? 1) <= 1} className="flex h-10 w-10 items-center justify-center rounded-pill border border-border text-ink-secondary disabled:opacity-40 hover:border-primary hover:text-primary" aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button>
                    <span className="text-sm font-bold text-ink-secondary">Page {submitted?.page} of {totalPages}</span>
                    <button onClick={() => goToPage((submitted?.page ?? 1) + 1)} disabled={(submitted?.page ?? 1) >= totalPages} className="flex h-10 w-10 items-center justify-center rounded-pill border border-border text-ink-secondary disabled:opacity-40 hover:border-primary hover:text-primary" aria-label="Next page"><ChevronRight className="h-4 w-4" /></button>
                  </nav>
                )}
              </>
            )}

            {!loading && !error && !searched && (
              <EmptyJobs message="Find your next role" hint="Enter a keyword above and press Search Jobs to see live listings." />
            )}
          </div>
        </div>
      </main>

      {selected && <JobDetails job={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
