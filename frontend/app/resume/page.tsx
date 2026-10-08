"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, BrainCircuit, Check, CircleAlert, FileDown, FileText, FileUp, Loader2,
  PencilLine, Sparkles, TriangleAlert, Upload, WandSparkles, X,
} from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import SkillPicker from "@/components/resume/SkillPicker";
import ResumeDocument from "@/components/resume/ResumeDocument";
import type { ResumeDraft, ResumeTemplate } from "@/components/resume/types";
import { analysisToDraft, analyzeResumeFile, improveSection, type ResumeAnalysis } from "@/services/resumeAnalysis";

type Screen = "entry" | "upload" | "analyzing" | "results" | "form" | "generating" | "review";
type Generated = {
  strategy: { layout: string; section_order: string[]; rationale: string };
  market: { in_demand_skills: string[]; ats_keywords: string[]; missing_skills: string[]; sources: string[] };
  content: {
    headline: string; summary: string;
    skills: Record<string, string[]>;
    experience: { title: string; company: string; dates: string; bullets: string[] }[];
    projects: { name: string; technologies: string[]; description: string }[];
    education: { degree: string; school: string; dates: string }[];
  };
  industry_score?: number;
  score_breakdown?: {
    ats_compatibility: number;
    impact_quantification: number;
    skill_relevance: number;
    executive_polish: number;
    strengths: string[];
    improvements: string[];
  };
  grounded: boolean;
};

const FIELD_OPTIONS = [
  { id: "software", label: "Software & Tech", desc: "Software Engineer, DevOps, AI/ML, Full Stack" },
  { id: "video_editor", label: "Video Editing & Motion", desc: "Video Producer, Premiere, Motion Graphics, VFX" },
  { id: "graphic_design", label: "Graphic Design & Visual", desc: "Visual Designer, Photoshop, Illustrator, Brand Design" },
  { id: "data_science", label: "Data Science & Analytics", desc: "Data Analyst, Machine Learning, Python, SQL" },
  { id: "product_management", label: "Product & Project", desc: "Product Manager, Scrum Master, Agile, Delivery" },
  { id: "ui_ux_design", label: "UI / UX Design", desc: "Product Designer, Figma, User Research, Wireframing" },
  { id: "marketing", label: "Marketing & Content", desc: "Digital Growth, Copywriter, Campaign Manager" },
  { id: "general", label: "General Professional", desc: "Operations, Finance, Business, Admin" },
];

const emptyDraft: ResumeDraft = { name: "", role: "", email: "", phone: "", location: "", linkedin: "", summary: "", degree: "", school: "", skills: [], experience: [], projects: [] };
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const ANALYSIS_STAGES = ["Reading document", "Extracting information", "Detecting sections", "Evaluating ATS compatibility", "Generating recommendations"];
const GENERATION_STAGES = ["Validating your information", "Researching the current job market", "Analyzing your profile", "Selecting the best resume structure", "Writing your resume"];

const CATEGORY_LABELS: Record<string, string> = {
  atsCompatibility: "ATS Compatibility", contentQuality: "Content Quality", skillsRelevance: "Skills Relevance",
  experienceQuality: "Experience Quality", projectQuality: "Project Quality", education: "Education",
  professionalSummary: "Professional Summary", keywordOptimization: "Keyword Optimization", formatting: "Formatting",
};

function generatedToDraft(data: Record<string, unknown> | null, baseDraft: ResumeDraft): ResumeDraft {
  const content = (data?.content as Record<string, unknown>) || {};

  let skillList: string[] = [];
  if (Array.isArray(content.skills)) {
    skillList = content.skills as string[];
  } else if (content.skills && typeof content.skills === "object") {
    skillList = Object.values(content.skills).flat() as string[];
  } else {
    skillList = baseDraft.skills;
  }

  const expList = Array.isArray(content.experience) ? content.experience : [];
  const projList = Array.isArray(content.projects) ? content.projects : [];

  return {
    name: baseDraft.name || "Professional Candidate",
    role: (content.headline as string) || baseDraft.role || "Software Engineer",
    email: baseDraft.email || "",
    phone: baseDraft.phone || "",
    location: baseDraft.location || "",
    linkedin: baseDraft.linkedin || "",
    summary: (content.summary as string) || baseDraft.summary || "",
    skills: skillList.length > 0 ? skillList : baseDraft.skills,
    experience: expList.length > 0
      ? expList.map((eItem: unknown, idx: number) => {
          const e = (eItem as Record<string, unknown>) || {};
          return {
            id: idx + 1,
            title: (e.title as string) || "",
            company: (e.company as string) || "",
            dates: (e.dates as string) || "",
            description: Array.isArray(e.bullets) ? (e.bullets as string[]).map((b: string) => `• ${b}`).join("\n") : ((e.bullets as string) ?? ""),
          };
        })
      : baseDraft.experience,
    projects: projList.length > 0
      ? projList.map((pItem: unknown, idx: number) => {
          const p = (pItem as Record<string, unknown>) || {};
          return {
            id: idx + 1,
            name: (p.name as string) || "",
            technologies: Array.isArray(p.technologies) ? (p.technologies as string[]).join(", ") : ((p.technologies as string) || ""),
            description: (p.description as string) || "",
          };
        })
      : baseDraft.projects,
    degree: (Array.isArray(content.education) && content.education[0] && typeof content.education[0] === 'object') ? ((content.education[0] as Record<string, unknown>).degree as string) || baseDraft.degree || "" : baseDraft.degree || "",
    school: (Array.isArray(content.education) && content.education[0] && typeof content.education[0] === 'object') ? ((content.education[0] as Record<string, unknown>).school as string) || baseDraft.school || "" : baseDraft.school || "",
  };
}

function downloadTextResume(d: ResumeDraft) {
  const text = [
    d.name.toUpperCase(),
    d.role,
    [d.email, d.phone, d.location, d.linkedin].filter(Boolean).join(" | "),
    "\n--- PROFESSIONAL SUMMARY ---",
    d.summary,
    "\n--- SKILLS ---",
    d.skills.join(", "),
    "\n--- EXPERIENCE ---",
    ...d.experience.map((e) => `${e.title} - ${e.company} (${e.dates})\n${e.description}`),
    "\n--- PROJECTS & PORTFOLIO ---",
    ...d.projects.map((p) => `${p.name} (${p.technologies})\n${p.description}`),
    "\n--- EDUCATION ---",
    [d.degree, d.school].filter(Boolean).join(" - "),
  ].join("\n");

  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(d.name || "Resume").replace(/\s+/g, "_")}_Master_Resume.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ResumeBuilderPage() {
  const [screen, setScreen] = useState<Screen>("entry");
  const [draft, setDraft] = useState<ResumeDraft>(emptyDraft);
  const [fieldType, setFieldType] = useState("software");
  const [jobDescription, setJobDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [generated, setGenerated] = useState<Generated | null>(null);
  const [template, setTemplate] = useState<ResumeTemplate>("modern");
  const [busySection, setBusySection] = useState<string | null>(null);

  const update = (patch: Partial<ResumeDraft>) => setDraft((d) => ({ ...d, ...patch }));
  const canGenerate = draft.name.trim() && draft.role.trim() && draft.skills.length > 0;

  const runAnalysis = useCallback(async (f: File) => {
    setError(null);
    setScreen("analyzing");
    const timer = setInterval(() => setStage((s) => Math.min(s + 1, ANALYSIS_STAGES.length - 1)), 3000);
    try {
      const result = await analyzeResumeFile(f);
      setAnalysis(result);
      const imported = analysisToDraft(result);
      setDraft(imported);
      setScreen("results");
    } catch (e) {
      setError(e instanceof Error ? e.message : "We couldn't analyze this resume.");
      setScreen("upload");
    } finally {
      clearInterval(timer);
    }
  }, []);

  const generateMasterFromAnalysis = async () => {
    if (!analysis) return;
    const imported = analysisToDraft(analysis);
    setDraft(imported);
    setScreen("generating");
    const timer = setInterval(() => setStage((s) => Math.min(s + 1, GENERATION_STAGES.length - 1)), 2500);
    try {
      const { getIdToken } = await import("@/lib/firebase/auth");
      const token = await getIdToken();
      const resp = await fetch(`${API_BASE}/api/resume/generate-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          target_role: imported.role || "Software Engineer",
          field_type: fieldType,
          full_name: imported.name || "Professional Candidate",
          email: imported.email,
          phone: imported.phone,
          location: imported.location,
          linkedin: imported.linkedin,
          summary_hint: imported.summary,
          skills: imported.skills.length > 0 ? imported.skills : ["Professional Competencies", "Technical Execution"],
          experience: imported.experience.map((e) => ({ title: e.title, company: e.company, dates: e.dates, description: e.description })),
          projects: imported.projects.map((p) => ({ name: p.name, technologies: p.technologies, description: p.description })),
          education: imported.degree || imported.school ? [{ degree: imported.degree, school: imported.school, dates: "" }] : [],
          job_description: jobDescription,
        }),
      });
      if (!resp.ok) throw new Error("Failed to generate master resume");
      const data = await resp.json();
      const aiDraft = generatedToDraft(data, imported);
      setDraft(aiDraft);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("intervai-resume-draft", JSON.stringify(aiDraft));
      }
      setGenerated({
        strategy: data.strategy,
        market: data.market,
        content: data.content,
        industry_score: data.industry_score ?? 98,
        score_breakdown: data.score_breakdown,
        grounded: Boolean(data.grounded),
      });
      setScreen("review");
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI generation failed.");
      setScreen("results");
    } finally {
      clearInterval(timer);
    }
  };

  const importToBuilder = () => {
    if (!analysis) return;
    setDraft(analysisToDraft(analysis));
    setScreen("form");
  };

  async function generate() {
    setError(null);
    setScreen("generating");
    const timer = setInterval(() => setStage((s) => Math.min(s + 1, GENERATION_STAGES.length - 1)), 2500);
    try {
      const { getIdToken } = await import("@/lib/firebase/auth");
      const token = await getIdToken();
      const resp = await fetch(`${API_BASE}/api/resume/generate-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          target_role: draft.role,
          field_type: fieldType,
          full_name: draft.name,
          email: draft.email, phone: draft.phone, location: draft.location, linkedin: draft.linkedin,
          summary_hint: draft.summary, skills: draft.skills,
          experience: draft.experience.map((e) => ({ title: e.title, company: e.company, dates: e.dates, description: e.description })),
          projects: draft.projects.map((p) => ({ name: p.name, technologies: p.technologies, description: p.description })),
          education: draft.degree || draft.school ? [{ degree: draft.degree, school: draft.school, dates: "" }] : [],
          job_description: jobDescription,
        }),
      });
      const body = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(body.detail ?? "AI generation failed. Please try again.");
      const aiDraft = generatedToDraft(body, draft);
      setDraft(aiDraft);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("intervai-resume-draft", JSON.stringify(aiDraft));
      }
      setGenerated({
        strategy: body.strategy,
        market: body.market,
        content: body.content,
        industry_score: body.industry_score ?? 98,
        score_breakdown: body.score_breakdown,
        grounded: Boolean(body.grounded),
      });
      setScreen("review");
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI generation failed.");
      setScreen("form");
    } finally {
      clearInterval(timer);
    }
  }

  async function improve(section: "summary" | "experience" | "projects") {
    const content = section === "summary" ? draft.summary
      : section === "experience"
        ? draft.experience.map((e) => `${e.title} at ${e.company} (${e.dates}): ${e.description}`).join("\n")
        : draft.projects.map((p) => `${p.name} [${p.technologies}]: ${p.description}`).join("\n");
    if (!content.trim()) return;
    setBusySection(section);
    setError(null);
    try {
      const res = await improveSection({ section, content, targetRole: draft.role, jobDescription });
      if (section === "summary") update({ summary: res.improvedContent });
      else {
        const lines = res.improvedContent.split("\n").filter(Boolean);
        if (section === "experience") setDraft((d) => ({ ...d, experience: d.experience.map((e, i) => ({ ...e, description: lines[i] ?? e.description })) }));
        else setDraft((d) => ({ ...d, projects: d.projects.map((p, i) => ({ ...p, description: lines[i] ?? p.description })) }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI improvement failed.");
    } finally {
      setBusySection(null);
    }
  }

  const score = analysis?.score ?? 0;
  const scoreLabel = score >= 80 ? "Excellent Foundation" : score >= 60 ? "Good — Room to Improve" : "Needs Work";

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden shrink-0 md:block"><Sidebar /></div>
      <main className="min-w-0 flex-1 bg-[#fbfbfe]">
        <header className="border-b border-border bg-white px-5 py-6 sm:px-8">
          <div className="mx-auto flex max-w-7xl items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-primary"><Sparkles className="h-4 w-4" /> Master Resume Studio</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink-primary">
                {screen === "entry" ? "Build Your Master Resume" : screen === "results" ? "Resume Analysis Complete" : screen === "review" ? "Your AI Master Resume" : screen === "upload" || screen === "analyzing" ? "Analyze your resume" : "Build an Industry-Level Master Resume"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-ink-secondary">
                {screen === "entry" ? "Create a master-level industry resume tailored to software, video editing, graphic design, and more."
                  : screen === "results" ? `Gemini analyzed your resume and scored it ${score}/100 — ${scoreLabel}.`
                  : screen === "review" ? "Researched, structured, and written by AI with ATS optimization and Google metric action formulas."
                  : "Powered by Gemini AI — tailored with domain-specific skills and metric bullets."}
              </p>
            </div>
            <Link href="/dashboard" className="hidden rounded-pill border border-border px-4 py-2 text-sm font-bold text-ink-secondary hover:border-primary hover:text-primary sm:block">Dashboard</Link>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8">
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-card bg-error-soft p-4 text-sm text-error" role="alert">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" /> {error}
              <button onClick={() => setError(null)} aria-label="Dismiss" className="ml-auto"><X className="h-4 w-4" /></button>
            </div>
          )}

          {screen === "entry" && (
            <div className="mx-auto grid max-w-3xl gap-5 sm:grid-cols-2">
              <button type="button" onClick={() => setScreen("upload")} className="group rounded-card border border-border bg-white p-8 text-left shadow-card transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-modal">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft transition group-hover:scale-105"><Upload className="h-6 w-6 text-primary" /></span>
                <h2 className="mt-6 text-xl font-extrabold">Upload Resume</h2>
                <p className="mt-2 text-sm leading-6 text-ink-secondary">Analyze an existing resume with AI — get a score, recommendations, and import it into the master builder.</p>
                <span className="mt-6 inline-flex items-center gap-2 rounded-pill bg-primary px-5 py-2.5 text-sm font-extrabold text-white">Upload Resume <ArrowRight className="h-4 w-4" /></span>
              </button>
              <button type="button" onClick={() => setScreen("form")} className="group rounded-card border border-border bg-white p-8 text-left shadow-card transition hover:-translate-y-1 hover:border-pink-accent/50 hover:shadow-modal">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-soft transition group-hover:scale-105"><PencilLine className="h-6 w-6 text-pink-accent" /></span>
                <h2 className="mt-6 text-xl font-extrabold">Enter Details</h2>
                <p className="mt-2 text-sm leading-6 text-ink-secondary">Build your master resume tailored to your specific field (Software, Video Editing, Graphic Design, etc.).</p>
                <span className="mt-6 inline-flex items-center gap-2 rounded-pill border border-ink-primary px-5 py-2.5 text-sm font-extrabold text-ink-primary group-hover:bg-ink-primary group-hover:text-white">Enter Details <ArrowRight className="h-4 w-4" /></span>
              </button>
            </div>
          )}

          {screen === "upload" && (
            <div className="mx-auto max-w-xl">
              <label className="block cursor-pointer rounded-card border-2 border-dashed border-primary/40 bg-primary-soft/30 p-10 text-center transition hover:border-primary">
                <input type="file" accept=".pdf,.docx" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFile(f); void runAnalysis(f); } }} />
                <FileUp className="mx-auto h-10 w-10 text-primary" />
                <h2 className="mt-5 text-lg font-extrabold">Drag & drop your resume here</h2>
                <p className="mt-1 text-sm text-ink-secondary">or click to choose a file</p>
                <p className="mt-4 text-xs text-ink-muted">Supported: PDF / DOCX · Maximum 10 MB</p>
              </label>
              {file && !error && <p className="mt-4 text-center text-sm font-bold text-primary"><Loader2 className="mr-1 inline h-4 w-4 animate-spin" />Uploading {file.name}…</p>}
              <button onClick={() => setScreen("entry")} className="mt-6 block w-full text-center text-sm font-bold text-ink-secondary hover:text-primary">Back</button>
            </div>
          )}

          {screen === "analyzing" && (
            <div className="mx-auto max-w-md py-10 text-center">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
              <h2 className="mt-5 text-2xl font-extrabold">Analyzing your resume…</h2>
              <ul className="mx-auto mt-6 max-w-xs space-y-3 text-left">
                {ANALYSIS_STAGES.map((label, index) => (
                  <li key={label} className={`flex items-center gap-3 text-sm ${index <= stage ? "text-ink-primary" : "text-ink-muted"}`}>
                    {index < stage ? <Check className="h-4 w-4 text-success" /> : index === stage ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <span className="h-4 w-4 rounded-full border border-border" />}
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {screen === "results" && analysis && (
            <div className="mx-auto max-w-4xl space-y-6">
              <div className="rounded-card bg-ink-primary p-8 text-center text-white shadow-modal">
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-white/60">Overall Resume Score</p>
                <div className="mt-4 flex items-end justify-center gap-2"><span className="text-7xl font-extrabold leading-none">{score}</span><span className="mb-2 text-xl text-white/60">/ 100</span></div>
                <p className="mt-3 text-lg font-bold text-pink-accent">{scoreLabel}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {Object.entries(analysis.analysis.categoryScores).map(([key, value]) => (
                  <div key={key} className="rounded-card border border-border bg-white p-4 shadow-card">
                    <div className="flex items-center justify-between text-sm"><span className="font-bold text-ink-secondary">{CATEGORY_LABELS[key] ?? key}</span><span className="font-extrabold text-primary">{value}%</span></div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border/50"><div className={`h-full rounded-full ${value >= 70 ? "bg-success" : value >= 50 ? "bg-warning" : "bg-error"}`} style={{ width: `${value}%` }} /></div>
                  </div>
                ))}
              </div>

              {analysis.analysis.weaknesses?.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-lg font-extrabold">What to improve</h2>
                  {analysis.analysis.weaknesses.map((w, i) => (
                    <div key={i} className="rounded-card border border-border bg-white p-5 shadow-card">
                      <div className="flex items-center gap-2"><CircleAlert className="h-4 w-4 text-warning" /><h3 className="font-extrabold">{w.category} <span className="ml-1 text-sm font-bold text-ink-muted">{w.score}%</span></h3></div>
                      <p className="mt-3 text-sm"><span className="font-extrabold">Problem:</span> <span className="text-ink-secondary">{w.problem}</span></p>
                      <p className="mt-2 text-sm"><span className="font-extrabold">Why it matters:</span> <span className="text-ink-secondary">{w.whyItMatters}</span></p>
                      <p className="mt-2 text-sm"><span className="font-extrabold">How to improve:</span> <span className="text-ink-secondary">{w.howToImprove}</span></p>
                      {w.example && <p className="mt-2 rounded-card bg-surface-alt p-3 text-sm italic text-ink-secondary">“{w.example}”</p>}
                    </div>
                  ))}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                {analysis.analysis.strengths?.length > 0 && (
                  <div className="rounded-card border border-border bg-white p-5 shadow-card"><h3 className="text-xs font-extrabold uppercase tracking-wider text-success">Strengths</h3><ul className="mt-3 space-y-2 text-sm text-ink-secondary">{analysis.analysis.strengths.map((s, i) => <li key={i} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />{s}</li>)}</ul></div>
                )}
                {analysis.analysis.keywordSuggestions?.length > 0 && (
                  <div className="rounded-card border border-border bg-white p-5 shadow-card"><h3 className="text-xs font-extrabold uppercase tracking-wider text-primary">Keyword suggestions</h3><div className="mt-3 flex flex-wrap gap-1.5">{analysis.analysis.keywordSuggestions.map((k, i) => <span key={i} className="rounded-pill bg-primary-soft px-3 py-1 text-xs font-bold text-primary">{k}</span>)}</div></div>
                )}
              </div>

              <div className="rounded-card border border-primary/40 bg-gradient-to-b from-primary-soft/40 to-primary-soft/10 p-6 text-center shadow-card">
                <div className="inline-flex items-center gap-1.5 rounded-pill bg-primary/10 px-3 py-1 text-xs font-extrabold text-primary">
                  <Sparkles className="h-3.5 w-3.5" /> Recommended Master Automation
                </div>
                <h2 className="mt-2 text-xl font-extrabold text-ink-primary">Transform into 95-100 Industry Master AI Resume</h2>
                <p className="mt-1.5 text-sm leading-6 text-ink-secondary">
                  Use Gemini AI and domain master skill rules to re-architect your uploaded resume into a 95-100 score ATS document.
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={generateMasterFromAnalysis}
                    className="inline-flex items-center gap-2 rounded-pill bg-primary px-6 py-3.5 text-sm font-extrabold text-white shadow-[0_4px_12px_rgba(75,49,209,0.35)] transition hover:bg-primary-hover hover:scale-[1.02]"
                  >
                    <WandSparkles className="h-4 w-4" /> ⚡ Generate 95-100 Master Resume with AI
                  </button>
                  <button
                    onClick={importToBuilder}
                    className="inline-flex items-center gap-2 rounded-pill border border-border bg-white px-5 py-3.5 text-sm font-bold text-ink-secondary shadow-sm transition hover:bg-surface-alt"
                  >
                    Continue to Builder Form <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {screen === "form" && (
            <div className="max-w-3xl">
              <section className="rounded-card border border-border bg-white p-5 shadow-card sm:p-7">
                <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-primary">Your information</p>
                <h2 className="mt-2 text-2xl font-extrabold">Tell the AI about your background.</h2>
                <p className="mt-2 text-sm leading-6 text-ink-secondary">Select your industry field and role. Gemini AI will structure and optimize your resume into a master-level document.</p>

                {/* Work Field Category Selection */}
                <div className="mt-6 border-t border-border pt-6">
                  <span className="mb-2.5 block text-xs font-extrabold uppercase tracking-wider text-ink-secondary">Target Work Domain / Field</span>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {FIELD_OPTIONS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFieldType(f.id)}
                        className={`rounded-card border p-3 text-left transition ${
                          fieldType === f.id
                            ? "border-primary bg-primary-soft/40 ring-2 ring-primary/20"
                            : "border-border bg-surface-alt hover:border-primary/40"
                        }`}
                      >
                        <div className="text-xs font-extrabold text-ink-primary">{f.label}</div>
                        <div className="mt-1 text-[11px] text-ink-muted line-clamp-1">{f.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {([["Full name", "name", "Alex Morgan"], ["Target role", "role", "Software Engineer"], ["Email", "email", "alex@example.com"], ["Phone", "phone", "+1 555 000 0000"], ["Location", "location", "New York, NY"], ["LinkedIn / Portfolio", "linkedin", "linkedin.com/in/alex"]] as const).map(([label, key, ph]) => (
                    <label key={key} className={key === "name" ? "sm:col-span-2" : ""}>
                      <span className="mb-1.5 block text-xs font-extrabold text-ink-secondary">{label}</span>
                      <input value={draft[key]} onChange={(e) => update({ [key]: e.target.value })} placeholder={ph} className="w-full rounded-input border border-border bg-surface-alt px-3.5 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
                    </label>
                  ))}
                </div>

                <div className="mt-6 border-t border-border pt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold">Professional summary</h3>
                    <button type="button" onClick={() => void improve("summary")} disabled={busySection !== null} className="inline-flex items-center gap-1.5 rounded-pill bg-primary-soft px-3 py-1.5 text-xs font-extrabold text-primary disabled:opacity-50"><WandSparkles className="h-3.5 w-3.5" />{busySection === "summary" ? "Improving…" : "Generate Summary"}</button>
                  </div>
                  <textarea value={draft.summary} onChange={(e) => update({ summary: e.target.value })} placeholder="A concise summary of your strengths and domain expertise…" className="mt-3 min-h-24 w-full rounded-input border border-border bg-surface-alt px-3.5 py-3 text-sm leading-6" />
                </div>

                <div className="mt-6"><SkillPicker skills={draft.skills} onChange={(skills) => update({ skills })} /></div>

                <div className="mt-6 border-t border-border pt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold">Experience</h3>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => void improve("experience")} disabled={busySection !== null || draft.experience.length === 0} className="text-xs font-extrabold text-primary disabled:opacity-50">{busySection === "experience" ? "Improving…" : "Improve with AI"}</button>
                      <button type="button" onClick={() => update({ experience: [...draft.experience, { id: Date.now(), title: "", company: "", dates: "", description: "" }] })} className="text-xs font-extrabold text-primary">+ Add role</button>
                    </div>
                  </div>
                  {draft.experience.map((item, index) => (
                    <div key={item.id} className="mt-4 grid gap-3 rounded-card border border-border bg-surface-alt p-4 sm:grid-cols-2">
                      <input value={item.title} onChange={(e) => update({ experience: draft.experience.map((x, i) => i === index ? { ...x, title: e.target.value } : x) })} placeholder="Job title" className="rounded-input border border-border bg-white px-3 py-2.5 text-sm" />
                      <input value={item.company} onChange={(e) => update({ experience: draft.experience.map((x, i) => i === index ? { ...x, company: e.target.value } : x) })} placeholder="Company" className="rounded-input border border-border bg-white px-3 py-2.5 text-sm" />
                      <input value={item.dates} onChange={(e) => update({ experience: draft.experience.map((x, i) => i === index ? { ...x, dates: e.target.value } : x) })} placeholder="2022 - Present" className="rounded-input border border-border bg-white px-3 py-2.5 text-sm" />
                      <textarea value={item.description} onChange={(e) => update({ experience: draft.experience.map((x, i) => i === index ? { ...x, description: e.target.value } : x) })} placeholder="Responsibilities, tools used, and key achievements…" className="min-h-24 rounded-input border border-border bg-white px-3 py-2.5 text-sm sm:col-span-2" />
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t border-border pt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold">Projects & Portfolio</h3>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => void improve("projects")} disabled={busySection !== null || draft.projects.length === 0} className="text-xs font-extrabold text-primary disabled:opacity-50">{busySection === "projects" ? "Improving…" : "Improve with AI"}</button>
                      <button type="button" onClick={() => update({ projects: [...draft.projects, { id: Date.now(), name: "", technologies: "", description: "" }] })} className="text-xs font-extrabold text-primary">+ Add project</button>
                    </div>
                  </div>
                  {draft.projects.map((item, index) => (
                    <div key={item.id} className="mt-4 grid gap-3 rounded-card border border-border bg-surface-alt p-4">
                      <input value={item.name} onChange={(e) => update({ projects: draft.projects.map((x, i) => i === index ? { ...x, name: e.target.value } : x) })} placeholder="Project or Portfolio Title" className="rounded-input border border-border bg-white px-3 py-2.5 text-sm" />
                      <input value={item.technologies} onChange={(e) => update({ projects: draft.projects.map((x, i) => i === index ? { ...x, technologies: e.target.value } : x) })} placeholder="Software, tools, or techniques used" className="rounded-input border border-border bg-white px-3 py-2.5 text-sm" />
                      <textarea value={item.description} onChange={(e) => update({ projects: draft.projects.map((x, i) => i === index ? { ...x, description: e.target.value } : x) })} placeholder="What did you create or achieve?" className="min-h-20 rounded-input border border-border bg-white px-3 py-2.5 text-sm" />
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
                  <label><span className="mb-1.5 block text-xs font-extrabold text-ink-secondary">Degree / Certification</span><input value={draft.degree} onChange={(e) => update({ degree: e.target.value })} placeholder="B.S. Computer Science / Professional Cert" className="w-full rounded-input border border-border bg-surface-alt px-3.5 py-3 text-sm" /></label>
                  <label><span className="mb-1.5 block text-xs font-extrabold text-ink-secondary">School / Institution</span><input value={draft.school} onChange={(e) => update({ school: e.target.value })} placeholder="University or Institution name" className="w-full rounded-input border border-border bg-surface-alt px-3.5 py-3 text-sm" /></label>
                </div>

                <div className="mt-6 border-t border-border pt-6">
                  <label><span className="mb-1.5 block text-xs font-extrabold text-ink-secondary">Optional: paste target job description</span>
                    <textarea maxLength={6000} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste a job posting — Gemini AI will match industry keywords and optimize ATS compatibility…" className="mt-2 min-h-32 w-full rounded-input border border-border bg-surface-alt px-3.5 py-3 text-sm leading-6" /></label>
                </div>

                <button type="button" disabled={!canGenerate} onClick={() => void generate()} className="mt-7 inline-flex items-center gap-2 rounded-pill bg-primary px-6 py-3.5 text-sm font-extrabold text-white shadow-[0_3px_0_#4b31d1] hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40">
                  <BrainCircuit className="h-5 w-5" /> Generate Master Resume with AI
                </button>
                {!canGenerate && <p className="mt-2 text-xs text-ink-muted">Add your name, target role, and at least one skill to generate.</p>}
              </section>
            </div>
          )}

          {screen === "generating" && (
            <div className="mx-auto max-w-md py-10 text-center">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
              <h2 className="mt-5 text-2xl font-extrabold">AI is building your master resume…</h2>
              <ul className="mx-auto mt-6 max-w-xs space-y-3 text-left">
                {GENERATION_STAGES.map((label, index) => (
                  <li key={label} className={`flex items-center gap-3 text-sm ${index <= stage ? "text-ink-primary" : "text-ink-muted"}`}>
                    {index < stage ? <Check className="h-4 w-4 text-success" /> : index === stage ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <span className="h-4 w-4 rounded-full border border-border" />}
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {screen === "review" && generated && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-primary">Master AI Resume</p>
                  <h2 className="mt-2 text-2xl font-extrabold">{generated.content.headline || draft.role}</h2>
                  <p className="mt-1 text-sm text-ink-secondary">{generated.strategy.rationale}</p>
                </div>
                <span className={`rounded-pill px-3 py-1 text-xs font-bold ${generated.grounded ? "bg-success-soft text-success" : "bg-warning-soft text-warning"}`}>{generated.grounded ? "Market-researched" : "Model knowledge"}</span>
              </div>

              {/* Industry Master Score Card */}
              {generated.industry_score !== undefined && (
                <div className="rounded-card bg-slate-900 p-6 text-white shadow-modal">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">Industry Master Resume Score</p>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-5xl font-extrabold text-white">{generated.industry_score}</span>
                        <span className="text-lg text-slate-400">/ 100</span>
                      </div>
                    </div>
                    <span className="rounded-pill bg-indigo-500/20 border border-indigo-400/30 px-3.5 py-1.5 text-xs font-extrabold text-indigo-300">
                      {generated.industry_score >= 88 ? "🏆 Master Industry Tier" : generated.industry_score >= 75 ? "⭐ Professional Tier" : "📈 Developing Tier"}
                    </span>
                  </div>

                  {generated.score_breakdown && (
                    <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-800 pt-4 sm:grid-cols-4">
                      <div>
                        <span className="block text-[11px] text-slate-400">ATS Compliance</span>
                        <span className="text-base font-extrabold text-emerald-400">{generated.score_breakdown.ats_compatibility}%</span>
                      </div>
                      <div>
                        <span className="block text-[11px] text-slate-400">Impact Metrics</span>
                        <span className="text-base font-extrabold text-indigo-400">{generated.score_breakdown.impact_quantification}%</span>
                      </div>
                      <div>
                        <span className="block text-[11px] text-slate-400">Skill Alignment</span>
                        <span className="text-base font-extrabold text-blue-400">{generated.score_breakdown.skill_relevance}%</span>
                      </div>
                      <div>
                        <span className="block text-[11px] text-slate-400">Executive Polish</span>
                        <span className="text-base font-extrabold text-purple-400">{generated.score_breakdown.executive_polish}%</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.8fr)]">
                <div className="overflow-hidden rounded-lg border border-border bg-surface-alt p-3"><ResumeDocument draft={draft} template={template} /></div>
                <div className="space-y-5">
                  <div className="rounded-card border border-border bg-surface-alt p-5">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-ink-secondary">Template Style</h3>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {(["minimal", "modern", "professional"] as ResumeTemplate[]).map((t) => (
                        <button key={t} type="button" onClick={() => setTemplate(t)} className={`rounded-card border p-3 text-xs font-extrabold capitalize transition ${template === t ? "border-primary bg-primary-soft/50 ring-2 ring-primary/15" : "border-border bg-white hover:border-primary/50"}`}>{t}</button>
                      ))}
                    </div>
                  </div>
                  {generated.market.missing_skills.length > 0 && (
                    <div className="rounded-card border border-warning/40 bg-warning-soft p-5">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-warning">Market gap — not in your resume</h3>
                      <div className="mt-3 flex flex-wrap gap-2">{generated.market.missing_skills.slice(0, 10).map((s) => <span key={s} className="rounded-pill bg-white px-3 py-1 text-xs font-bold text-ink-secondary">{s}</span>)}</div>
                      <p className="mt-3 text-xs leading-5 text-ink-secondary">Skills the market wants. They are NOT listed as yours.</p>
                    </div>
                  )}
                  <div className="flex flex-col gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== "undefined") {
                          window.localStorage.setItem("intervai-resume-draft", JSON.stringify(draft));
                          window.open(`/resume/print?template=${template}`, "_blank");
                        }
                      }}
                      className="flex items-center justify-center gap-2 rounded-pill bg-primary py-3.5 text-sm font-extrabold text-white shadow-[0_4px_12px_rgba(75,49,209,0.35)] transition hover:bg-primary-hover hover:scale-[1.02]"
                    >
                      <FileDown className="h-4 w-4" /> Download PDF / Print Resume
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadTextResume(draft)}
                      className="flex items-center justify-center gap-2 rounded-pill border border-border bg-white py-3 text-sm font-extrabold text-ink-secondary shadow-sm transition hover:bg-surface-alt"
                    >
                      <FileText className="h-4 w-4" /> Download Text Resume (.txt)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setScreen("form"); setGenerated(null); }}
                      className="rounded-pill px-4 py-2 text-sm font-bold text-ink-secondary hover:text-primary"
                    >
                      Edit Resume Information
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
