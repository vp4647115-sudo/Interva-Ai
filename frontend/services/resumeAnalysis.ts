"use client";

import type { ResumeDraft } from "@/components/resume/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function authHeaders(): Promise<Record<string, string>> {
  const { getIdToken } = await import("@/lib/firebase/auth");
  const token = await getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface ResumeAnalysis {
  success: boolean;
  resumeData: {
    personalInfo?: Record<string, string | null>;
    summary?: string | null;
    skills?: string[];
    technicalSkills?: string[];
    softSkills?: string[];
    toolsAndFrameworks?: string[];
    languages?: string[];
    education?: { degree?: string | null; school?: string | null; fieldOfStudy?: string | null; dates?: string | null }[];
    experience?: { title?: string | null; company?: string | null; dates?: string | null; description?: string | null; bullets?: string[] }[];
    projects?: { name?: string | null; technologies?: string[] | string | null; description?: string | null }[];
    certifications?: string[];
  };
  analysis: {
    overallScore: number;
    categoryScores: Record<string, number>;
    strengths: string[];
    weaknesses: { category: string; score: number; problem: string; whyItMatters: string; howToImprove: string; example: string }[];
    atsWarnings: string[];
    missingSections: string[];
    keywordSuggestions: string[];
    recommendations: string[];
  };
  score: number;
  recommendations: string[];
}

export async function analyzeResumeFile(file: File): Promise<ResumeAnalysis> {
  const form = new FormData();
  form.append("file", file);
  const resp = await fetch(`${API_BASE}/api/resume/analyze`, {
    method: "POST",
    headers: await authHeaders(),
    body: form,
  });
  const body = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(body.detail ?? "We couldn't analyze this resume. Please try again or upload another file.");
  return body as ResumeAnalysis;
}

export async function improveSection(input: {
  section: string;
  content: string;
  targetRole?: string;
  jobDescription?: string;
}): Promise<{ improvedContent: string; changes: string[]; warnings: string[] }> {
  const resp = await fetch(`${API_BASE}/api/resume/improve`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(input),
  });
  const body = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(body.detail ?? "AI improvement is temporarily unavailable.");
  return body;
}

/** Map Gemini's extracted resume data into the builder's draft shape cleanly. */
export function analysisToDraft(analysis: ResumeAnalysis): ResumeDraft {
  const d = analysis.resumeData ?? {};
  const p = d.personalInfo ?? {};

  const allSkills = Array.from(new Set([
    ...(d.technicalSkills ?? []),
    ...(d.toolsAndFrameworks ?? []),
    ...(d.skills ?? []),
    ...(d.softSkills ?? []),
    ...(d.languages ?? []),
  ].filter((s): s is string => Boolean(s && s.trim()))));

  const eduFirst = d.education?.[0];
  const eduDegree = eduFirst?.degree ?? "";
  const eduField = eduFirst?.fieldOfStudy ? ` in ${eduFirst.fieldOfStudy}` : "";

  return {
    name: p.fullName ?? "",
    role: "",
    email: p.email ?? "",
    phone: p.phone ?? "",
    location: p.location ?? "",
    linkedin: p.linkedin ?? "",
    summary: d.summary ?? "",
    degree: `${eduDegree}${eduField}`.trim(),
    school: eduFirst?.school ?? "",
    skills: allSkills,
    experience: (d.experience ?? []).map((e, i) => {
      let desc = e.description ?? "";
      if (Array.isArray(e.bullets) && e.bullets.length > 0) {
        desc = e.bullets.map((b) => (b.startsWith("•") ? b : `• ${b}`)).join("\n");
      }
      return {
        id: i + 1,
        title: e.title ?? "",
        company: e.company ?? "",
        dates: e.dates ?? "",
        description: desc,
      };
    }),
    projects: (d.projects ?? []).map((pr, i) => {
      let techStr = "";
      if (Array.isArray(pr.technologies)) {
        techStr = pr.technologies.join(", ");
      } else if (typeof pr.technologies === "string") {
        techStr = pr.technologies;
      }
      return {
        id: i + 1,
        name: pr.name ?? "",
        technologies: techStr,
        description: pr.description ?? "",
      };
    }),
  };
}
