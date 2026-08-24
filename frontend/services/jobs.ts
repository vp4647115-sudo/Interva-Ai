export interface Job {
  id: string;
  title: string;
  company: string | null;
  companyLogo: string | null;
  location: string | null;
  country: string | null;
  city: string | null;
  workplaceType: string | null;
  employmentType: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  description: string | null;
  skills: string[];
  postedAt: string | null;
  source: string;
  applyUrl: string;
}

export interface JobSearchFilters {
  query: string;
  location: string;
  remote: "remote" | "on-site" | "hybrid" | "";
  jobType: string;
  experienceLevel: string;
  company: string;
  page: number;
  limit: number;
}

export interface JobSearchResponse {
  success: boolean;
  jobs: Job[];
  pagination: { page: number; limit: number; total: number };
}

export const emptyFilters: JobSearchFilters = {
  query: "",
  location: "",
  remote: "",
  jobType: "",
  experienceLevel: "",
  company: "",
  page: 1,
  limit: 20,
};

export async function searchJobs(
  filters: JobSearchFilters,
  signal?: AbortSignal
): Promise<JobSearchResponse> {
  const { getIdToken } = await import("@/lib/firebase/auth");
  const token = await getIdToken();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  const resp = await fetch(`${API_BASE}/api/jobs/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(filters),
    signal,
  });
  const body = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(body.detail ?? "Unable to load jobs right now.");
  return body as JobSearchResponse;
}

export function formatSalary(job: Job): string | null {
  if (job.salaryMin == null && job.salaryMax == null) return null;
  const cur = job.salaryCurrency ?? "";
  const fmt = (n: number) => n.toLocaleString();
  if (job.salaryMin != null && job.salaryMax != null && job.salaryMin !== job.salaryMax) {
    return `${cur}${fmt(job.salaryMin)} – ${cur}${fmt(job.salaryMax)}`;
  }
  const one = job.salaryMax ?? job.salaryMin!;
  return `${cur}${fmt(one)}`;
}

export function timeAgo(postedAt: string | null): string | null {
  if (!postedAt) return null;
  const then = new Date(postedAt).getTime();
  if (Number.isNaN(then)) return null;
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}
