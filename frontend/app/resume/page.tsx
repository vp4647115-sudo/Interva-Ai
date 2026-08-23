"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BrainCircuit, Check, FileDown, ImageDown, Loader2, Sparkles, TriangleAlert } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import SkillPicker from "@/components/resume/SkillPicker";
import ResumeDocument from "@/components/resume/ResumeDocument";
import type { ResumeDraft, ResumeTemplate } from "@/components/resume/types";

type Step = "role" | "info" | "skills" | "generating" | "review";
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
  grounded: boolean;
};

const roleOptions = ["Frontend Developer", "Backend Developer", "Full Stack Developer", "Java Developer", "Python Developer", "UI/UX Designer", "Data Analyst", "AI/ML Engineer", "Video Editor"];
const emptyDraft: ResumeDraft = { name: "", role: "", email: "", phone: "", location: "", linkedin: "", summary: "", degree: "", school: "", skills: [], experience: [], projects: [] };

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const STAGES = [
  "Validating your information…",
  "Researching the current job market…",
  "Analyzing your profile…",
  "Selecting the best resume structure…",
  "Writing your resume…",
];

export default function ResumeBuilderPage() {
  const [step, setStep] = useState<Step>("role");
  const [draft, setDraft] = useState<ResumeDraft>(emptyDraft);
  const [jobDescription, setJobDescription] = useState("");
  const [stage, setStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState<Generated | null>(null);
  const [template, setTemplate] = useState<ResumeTemplate>("modern");

  const update = (patch: Partial<ResumeDraft>) => setDraft((d) => ({ ...d, ...patch }));

  const canGenerate = draft.name.trim() && draft.role.trim() && draft.skills.length > 0;

  async function generate() {
    setError(null);
    setStep("generating");
    const timer = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 2500);
    try {
      const { getIdToken } = await import("@/lib/firebase/auth");
      const token = await getIdToken();
      const resp = await fetch(`${API_BASE}/api/resume/generate-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          target_role: draft.role,
          full_name: draft.name,
          email: draft.email, phone: draft.phone, location: draft.location, linkedin: draft.linkedin,
          summary_hint: draft.summary,
          skills: draft.skills,
          experience: draft.experience.map((e) => ({ title: e.title, company: e.company, dates: e.dates, description: e.description })),
          projects: draft.projects.map((p) => ({ name: p.name, technologies: p.technologies, description: p.description })),
          education: draft.degree || draft.school ? [{ degree: draft.degree, school: draft.school, dates: "" }] : [],
          job_description: jobDescription,
        }),
      });
      const body = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(body.detail ?? "AI generation failed. Please try again.");
      setGenerated(body as Generated);
      setStep("review");
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI generation failed.");
      setStep("skills");
    } finally {
      clearInterval(timer);
    }
  }

  /** Flatten AI content into the renderer's draft shape. AI output is the source of truth. */
  const aiDraft: ResumeDraft | null = generated ? {
    ...emptyDraft,
    name: draft.name, email: draft.email, phone: draft.phone, location: draft.location, linkedin: draft.linkedin,
    role: generated.content.headline || draft.role,
    summary: generated.content.summary,
    skills: Object.values(generated.content.skills).flat(),
    experience: generated.content.experience.map((e, i) => ({ id: i, title: e.title, company: e.company, dates: e.dates, description: e.bullets.join("\n") })),
    projects: generated.content.projects.map((p, i) => ({ id: i, name: p.name, technologies: p.technologies.join(", "), description: p.description })),
    degree: generated.content.education[0]?.degree ?? "", school: generated.content.education[0]?.school ?? "",
  } : null;

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden shrink-0 md:block"><Sidebar /></div>
      <main className="min-w-0 flex-1 bg-[#fbfbfe]">
        <header className="border-b border-border bg-white px-5 py-6 sm:px-8">
          <div className="mx-auto flex max-w-7xl items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-primary"><Sparkles className="h-4 w-4" /> Resume studio</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink-primary">
                {step === "review" ? "Your AI resume" : "Build a resume that gets read."}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-ink-secondary">
                {step === "review" ? "Researched, structured, and written by AI from your real information." : "Tell the AI your target role and real experience — it researches the market and writes the resume."}
              </p>
            </div>
            <Link href="/dashboard" className="hidden rounded-pill border border-border px-4 py-2 text-sm font-bold text-ink-secondary hover:border-primary hover:text-primary sm:block">Dashboard</Link>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8">
          {step !== "generating" && step !== "review" && (
            <div className="mb-7 flex items-center gap-2 overflow-x-auto pb-1">
              {["role", "info", "skills"].map((item, index) => {
                const labels = ["Target role", "Your information", "Skills"];
                const active = item === step;
                const done = ["role", "info", "skills"].indexOf(step) > index;
                return <div key={item} className="flex min-w-max items-center gap-2"><div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold ${active ? "bg-primary text-white" : done ? "bg-success-soft text-success" : "bg-white text-ink-muted ring-1 ring-border"}`}>{done ? <Check className="h-4 w-4" /> : index + 1}</div><span className={`text-xs font-bold ${active ? "text-ink-primary" : "text-ink-muted"}`}>{labels[index]}</span>{index < 2 && <div className="mx-1 h-px w-8 bg-border sm:w-14" />}</div>;
              })}
            </div>
          )}

          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-card bg-error-soft p-4 text-sm text-error" role="alert">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          <div className={step === "review" ? "" : "max-w-3xl"}>
            <section className="rounded-card border border-border bg-white p-5 shadow-card sm:p-7">
              {step === "role" && (
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-primary">Step 01</p>
                  <h2 className="mt-2 text-2xl font-extrabold">What role are you targeting?</h2>
                  <p className="mt-2 text-sm leading-6 text-ink-secondary">The AI researches this role&apos;s current market before writing a single word.</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {roleOptions.map((role) => (
                      <button key={role} type="button" onClick={() => update({ role })} className={`rounded-pill px-4 py-2 text-sm font-bold transition ${draft.role === role ? "bg-primary text-white" : "border border-border bg-surface-alt text-ink-secondary hover:border-primary/50"}`}>{role}</button>
                    ))}
                  </div>
                  <label className="mt-5 block">
                    <span className="mb-1.5 block text-xs font-extrabold text-ink-secondary">Or enter a custom role</span>
                    <input value={roleOptions.includes(draft.role) ? "" : draft.role} onChange={(e) => update({ role: e.target.value })} placeholder="e.g. DevOps Engineer" className="w-full rounded-input border border-border bg-surface-alt px-3.5 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
                  </label>
                </div>
              )}

              {step === "info" && (
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-primary">Step 02</p>
                  <h2 className="mt-2 text-2xl font-extrabold">Tell the AI about you.</h2>
                  <p className="mt-2 text-sm leading-6 text-ink-secondary">Only real facts. The AI improves wording — it never invents experience.</p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {([["Full name", "name", "Alex Morgan"], ["Email", "email", "alex@example.com"], ["Phone", "phone", "+1 555 000 0000"], ["Location", "location", "New York, NY"], ["LinkedIn", "linkedin", "linkedin.com/in/alex"]] as const).map(([label, key, ph]) => (
                      <label key={key} className={key === "name" ? "sm:col-span-2" : ""}>
                        <span className="mb-1.5 block text-xs font-extrabold text-ink-secondary">{label}</span>
                        <input value={draft[key]} onChange={(e) => update({ [key]: e.target.value })} placeholder={ph} className="w-full rounded-input border border-border bg-surface-alt px-3.5 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
                      </label>
                    ))}
                  </div>
                  <div className="mt-6 border-t border-border pt-6">
                    <div className="flex items-center justify-between"><h3 className="font-extrabold">Experience</h3><button type="button" onClick={() => update({ experience: [...draft.experience, { id: Date.now(), title: "", company: "", dates: "", description: "" }] })} className="text-xs font-extrabold text-primary">+ Add role</button></div>
                    {draft.experience.map((item, index) => (
                      <div key={item.id} className="mt-4 grid gap-3 rounded-card border border-border bg-surface-alt p-4 sm:grid-cols-2">
                        <input value={item.title} onChange={(e) => update({ experience: draft.experience.map((x, i) => i === index ? { ...x, title: e.target.value } : x) })} placeholder="Job title" className="rounded-input border border-border bg-white px-3 py-2.5 text-sm" />
                        <input value={item.company} onChange={(e) => update({ experience: draft.experience.map((x, i) => i === index ? { ...x, company: e.target.value } : x) })} placeholder="Company" className="rounded-input border border-border bg-white px-3 py-2.5 text-sm" />
                        <input value={item.dates} onChange={(e) => update({ experience: draft.experience.map((x, i) => i === index ? { ...x, dates: e.target.value } : x) })} placeholder="2022 - Present" className="rounded-input border border-border bg-white px-3 py-2.5 text-sm" />
                        <textarea value={item.description} onChange={(e) => update({ experience: draft.experience.map((x, i) => i === index ? { ...x, description: e.target.value } : x) })} placeholder="What did you do? Include measurable results if you have them." className="min-h-24 rounded-input border border-border bg-white px-3 py-2.5 text-sm sm:col-span-2" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 border-t border-border pt-6">
                    <div className="flex items-center justify-between"><h3 className="font-extrabold">Projects</h3><button type="button" onClick={() => update({ projects: [...draft.projects, { id: Date.now(), name: "", technologies: "", description: "" }] })} className="text-xs font-extrabold text-primary">+ Add project</button></div>
                    {draft.projects.map((item, index) => (
                      <div key={item.id} className="mt-4 grid gap-3 rounded-card border border-border bg-surface-alt p-4">
                        <input value={item.name} onChange={(e) => update({ projects: draft.projects.map((x, i) => i === index ? { ...x, name: e.target.value } : x) })} placeholder="Project name" className="rounded-input border border-border bg-white px-3 py-2.5 text-sm" />
                        <input value={item.technologies} onChange={(e) => update({ projects: draft.projects.map((x, i) => i === index ? { ...x, technologies: e.target.value } : x) })} placeholder="Technologies used" className="rounded-input border border-border bg-white px-3 py-2.5 text-sm" />
                        <textarea value={item.description} onChange={(e) => update({ projects: draft.projects.map((x, i) => i === index ? { ...x, description: e.target.value } : x) })} placeholder="What did you build and contribute?" className="min-h-20 rounded-input border border-border bg-white px-3 py-2.5 text-sm" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
                    <label><span className="mb-1.5 block text-xs font-extrabold text-ink-secondary">Degree</span><input value={draft.degree} onChange={(e) => update({ degree: e.target.value })} placeholder="B.S. Computer Science" className="w-full rounded-input border border-border bg-surface-alt px-3.5 py-3 text-sm" /></label>
                    <label><span className="mb-1.5 block text-xs font-extrabold text-ink-secondary">School</span><input value={draft.school} onChange={(e) => update({ school: e.target.value })} placeholder="University name" className="w-full rounded-input border border-border bg-surface-alt px-3.5 py-3 text-sm" /></label>
                  </div>
                </div>
              )}

              {step === "skills" && (
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-primary">Step 03</p>
                  <h2 className="mt-2 text-2xl font-extrabold">Add your real skills.</h2>
                  <p className="mt-2 text-sm leading-6 text-ink-secondary">Search with partial text or typos — suggestions appear as you type.</p>
                  <div className="mt-6"><SkillPicker skills={draft.skills} onChange={(skills) => update({ skills })} /></div>
                  <label className="mt-7 block">
                    <span className="mb-1.5 block text-xs font-extrabold text-ink-secondary">Optional: paste a job description</span>
                    <textarea maxLength={6000} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste a posting to focus the AI's research on its exact requirements…" className="min-h-40 w-full rounded-input border border-border bg-surface-alt px-3.5 py-3 text-sm leading-6 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
                  </label>
                  <button type="button" disabled={!canGenerate} onClick={() => void generate()} className="mt-7 inline-flex items-center gap-2 rounded-pill bg-primary px-6 py-3.5 text-sm font-extrabold text-white shadow-[0_3px_0_#4b31d1] transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40">
                    <BrainCircuit className="h-5 w-5" /> Generate with AI
                  </button>
                  {!canGenerate && <p className="mt-2 text-xs text-ink-muted">Add your name, target role, and at least one skill to generate.</p>}
                </div>
              )}

              {step === "generating" && (
                <div className="py-10 text-center">
                  <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
                  <h2 className="mt-5 text-2xl font-extrabold">AI is building your resume</h2>
                  <ul className="mx-auto mt-6 max-w-sm space-y-3 text-left">
                    {STAGES.map((label, index) => (
                      <li key={label} className={`flex items-center gap-3 text-sm ${index <= stage ? "text-ink-primary" : "text-ink-muted"}`}>
                        {index < stage ? <Check className="h-4 w-4 text-success" /> : index === stage ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <span className="h-4 w-4 rounded-full border border-border" />}
                        {label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {step === "review" && generated && aiDraft && (
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-primary">AI generated</p>
                      <h2 className="mt-2 text-2xl font-extrabold">{generated.content.headline || draft.role}</h2>
                      <p className="mt-1 text-sm text-ink-secondary">{generated.strategy.rationale}</p>
                    </div>
                    <span className={`rounded-pill px-3 py-1 text-xs font-bold ${generated.grounded ? "bg-success-soft text-success" : "bg-warning-soft text-warning"}`}>{generated.grounded ? "Market-researched" : "Model knowledge"}</span>
                  </div>

                  <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.8fr)]">
                    <div className="overflow-hidden rounded-lg border border-border bg-surface-alt p-3"><ResumeDocument draft={aiDraft} template={template} /></div>
                    <div className="space-y-5">
                      <div className="rounded-card border border-border bg-surface-alt p-5">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-ink-secondary">Template</h3>
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          {(["minimal", "modern", "professional"] as ResumeTemplate[]).map((t) => (
                            <button key={t} type="button" onClick={() => setTemplate(t)} className={`rounded-card border p-3 text-xs font-extrabold capitalize transition ${template === t ? "border-primary bg-primary-soft/50 ring-2 ring-primary/15" : "border-border bg-white hover:border-primary/50"}`}>{t}</button>
                          ))}
                        </div>
                      </div>
                      {generated.market.missing_skills.length > 0 && (
                        <div className="rounded-card border border-warning/40 bg-warning-soft p-5">
                          <h3 className="text-xs font-extrabold uppercase tracking-wider text-warning">Market gap — not in your resume</h3>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {generated.market.missing_skills.slice(0, 10).map((s) => <span key={s} className="rounded-pill bg-white px-3 py-1 text-xs font-bold text-ink-secondary">{s}</span>)}
                          </div>
                          <p className="mt-3 text-xs leading-5 text-ink-secondary">Skills the market wants for this role. They are NOT listed as yours — learn them, then add them.</p>
                        </div>
                      )}
                      {generated.market.sources.length > 0 && (
                        <div className="rounded-card border border-border bg-surface-alt p-5">
                          <h3 className="text-xs font-extrabold uppercase tracking-wider text-ink-secondary">Research sources</h3>
                          <ul className="mt-2 space-y-1 text-xs text-primary">
                            {generated.market.sources.slice(0, 5).map((src) => <li key={src} className="truncate"><a href={src} target="_blank" rel="noreferrer" className="hover:underline">{src}</a></li>)}
                          </ul>
                        </div>
                      )}
                      <div className="flex flex-col gap-2">
                        <a href={`/resume/print?template=${template}`} className="flex items-center justify-center gap-2 rounded-pill bg-primary py-3 text-sm font-extrabold text-white shadow-[0_3px_0_#4b31d1]"><FileDown className="h-4 w-4" /> Export PDF</a>
                        <button type="button" onClick={() => window.print()} className="flex items-center justify-center gap-2 rounded-pill border border-ink-primary py-3 text-sm font-extrabold text-ink-primary hover:bg-ink-primary hover:text-white"><ImageDown className="h-4 w-4" /> Export PNG</button>
                        <button type="button" onClick={() => { setStep("info"); setGenerated(null); }} className="rounded-pill px-4 py-2 text-sm font-bold text-ink-secondary hover:text-primary">Edit information</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step !== "review" && step !== "generating" && (
                <div className="mt-8 flex justify-between border-t border-border pt-5">
                  <button disabled={step === "role"} onClick={() => setStep(step === "skills" ? "info" : "role")} className="rounded-pill px-4 py-2 text-sm font-bold text-ink-secondary disabled:invisible">Back</button>
                  {step !== "skills" && <button onClick={() => setStep(step === "role" ? "info" : "skills")} className="inline-flex items-center gap-2 rounded-pill bg-primary px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_3px_0_#4b31d1] hover:bg-primary-hover">Continue <ArrowRight className="h-4 w-4" /></button>}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
