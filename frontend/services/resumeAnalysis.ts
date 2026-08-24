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
    education?: { degree?: string | null; school?: string | null; dates?: string | null }[];
    experience?: { title?: string | null; company?: string | null; dates?: string | null; description?: string | null }[];
    projects?: { name?: string | null; technologies?: string | null; description?: string | null }[];
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

/** Map Gemini's extracted resume data into the builder's draft shape. */
export function analysisToDraft(analysis: ResumeAnalysis): ResumeDraft {
  const d = analysis.resumeData;
  const p = d.personalInfo ?? {};
  return {
    name: p.fullName ?? "",
    role: "",
    email: p.email ?? "",
    phone: p.phone ?? "",
    location: p.location ?? "",
    linkedin: p.linkedin ?? "",
    summary: d.summary ?? "",
    degree: d.education?.[0]?.degree ?? "",
    school: d.education?.[0]?.school ?? "",
    skills: [...(d.technicalSkills ?? []), ...(d.skills ?? []), ...(d.softSkills ?? [])].filter(Boolean),
    experience: (d.experience ?? []).map((e, i) => ({
      id: i, title: e.title ?? "", company: e.company ?? "", dates: e.dates ?? "", description: e.description ?? "",
    })),
    projects: (d.projects ?? []).map((pr, i) => ({
      id: i, name: pr.name ?? "", technologies: pr.technologies ?? "", description: pr.description ?? "",
    })),
  };
}
