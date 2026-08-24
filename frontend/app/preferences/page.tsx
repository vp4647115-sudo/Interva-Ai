"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark, Bot, Check, FileUp, Lightbulb, MessageSquareText, Plus, Save, SlidersHorizontal, User, Zap } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";

type Tab = "quick" | "job" | "answers" | "rejections";

const TABS: { id: Tab; label: string; badge?: number }[] = [
  { id: "quick", label: "Quick Settings" },
  { id: "job", label: "Job Preferences" },
  { id: "answers", label: "Answer Library", badge: 5 },
  { id: "rejections", label: "Rejection Reasons" },
];

const MODES = [
  { id: "auto", icon: Zap, title: "Auto mode", desc: "Fully hands-off. Maximum speed. Our AI agent finds and applies to matching jobs for you." },
  { id: "hybrid", icon: User, title: "Hybrid mode", desc: "Best balance of speed and control. We auto-apply to high-fit roles (75%+ match). You decide on the rest." },
  { id: "review", icon: Bot, title: "Review mode", desc: "Full control. Nothing sent without your approval. Review every match. Our agent handles the application once you approve." },
];

export default function PreferencesPage() {
  const [tab, setTab] = useState<Tab>("quick");
  const [mode, setMode] = useState("hybrid");
  const [jobTitles, setJobTitles] = useState<string[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [saved, setSaved] = useState(false);

  const addTitle = () => {
    const t = newTitle.trim();
    if (t && !jobTitles.includes(t)) setJobTitles([...jobTitles, t]);
    setNewTitle("");
  };

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden shrink-0 md:block"><Sidebar /></div>
      <main className="min-w-0 flex-1 bg-white">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-6 sm:px-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-primary">Preferences</h1>
          <button onClick={save} className="inline-flex items-center gap-2 rounded-pill bg-primary px-6 py-3 text-sm font-extrabold text-white shadow-[0_3px_0_#4b31d1] transition hover:bg-primary-hover">
            {saved ? <><Check className="h-4 w-4" /> Saved</> : <><Save className="h-4 w-4" /> Save Settings</>}
          </button>
        </header>

        <div className="px-6 sm:px-10">
          <nav className="flex gap-6 border-b border-border pt-5" aria-label="Preference sections">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} aria-current={tab === t.id}
                className={`relative flex items-center gap-2 pb-4 text-sm font-bold transition ${tab === t.id ? "text-primary" : "text-ink-secondary hover:text-ink-primary"}`}>
                {t.label}
                {t.badge && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1.5 text-[11px] font-extrabold text-white">{t.badge}</span>}
                {tab === t.id && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />}
              </button>
            ))}
          </nav>
        </div>

        <div className="px-6 py-7 sm:px-10">
          {tab === "quick" && (
            <div className="mx-auto max-w-5xl space-y-7">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-card bg-primary-soft/60 p-6">
                <div>
                  <h2 className="font-extrabold text-ink-primary">5 common application questions are still unanswered</h2>
                  <p className="mt-1 text-sm text-ink-secondary">Open Answer Library to fill them in once and keep future applications moving faster.</p>
                </div>
                <Link href="/dashboard" className="rounded-pill bg-primary px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_3px_0_#4b31d1] hover:bg-primary-hover">Open Answer Library</Link>
              </div>

              <section>
                <h2 className="text-lg font-extrabold">Application Mode</h2>
                <div className="mt-4 overflow-hidden rounded-card border border-border">
                  {MODES.map((m, i) => (
                    <button key={m.id} type="button" onClick={() => setMode(m.id)}
                      className={`flex w-full items-center gap-5 p-6 text-left transition ${i > 0 ? "border-t border-border" : ""} ${mode === m.id ? "bg-primary-soft/50" : "bg-white hover:bg-surface-alt"}`}>
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${mode === m.id ? "bg-primary text-white" : "bg-primary-soft text-primary"}`}><m.icon className="h-5 w-5" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-extrabold text-ink-primary">{m.title}</span>
                        <span className="mt-1 block text-sm leading-6 text-ink-secondary">{m.desc}</span>
                      </span>
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${mode === m.id ? "border-primary bg-primary" : "border-border bg-white"}`}>
                        {mode === m.id && <Check className="h-3.5 w-3.5 text-white" />}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="grid gap-4 border-t border-border pt-7 sm:grid-cols-[1fr_2fr]">
                <h2 className="text-lg font-extrabold">Job titles</h2>
                <div>
                  <div className="flex gap-2">
                    <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTitle(); } }}
                      placeholder="Add job title" className="min-w-0 flex-1 rounded-input border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
                    <button type="button" onClick={addTitle} className="rounded-input bg-primary-soft px-4 text-primary hover:bg-primary hover:text-white" aria-label="Add job title"><Plus className="h-4 w-4" /></button>
                  </div>
                  {jobTitles.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {jobTitles.map((t) => (
                        <button key={t} onClick={() => setJobTitles(jobTitles.filter((x) => x !== t))} className="rounded-pill bg-primary-soft px-3 py-1.5 text-xs font-bold text-primary">{t} ×</button>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section className="grid gap-4 border-t border-border pt-7 sm:grid-cols-[1fr_2fr]">
                <h2 className="text-lg font-extrabold">Your Resumes</h2>
                <div className="rounded-card border border-border bg-surface-alt p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-sm font-bold text-ink-secondary"><FileUp className="h-4 w-4" /> No resume uploaded</span>
                    <Link href="/resume" className="rounded-pill bg-primary px-4 py-2 text-xs font-extrabold text-white hover:bg-primary-hover">Upload Resume</Link>
                  </div>
                  <div className="mt-3 flex justify-end gap-4 text-xs font-extrabold">
                    <Link href="/resume" className="text-primary hover:underline">View all</Link>
                    <Link href="/resume" className="text-primary hover:underline">+ Create New Resume</Link>
                  </div>
                </div>
              </section>
            </div>
          )}

          {tab === "job" && (
            <div className="mx-auto max-w-3xl space-y-6">
              <div className="flex items-start gap-3 rounded-card bg-primary-soft/60 p-5"><SlidersHorizontal className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><p className="text-sm text-ink-secondary">Set the roles, locations, and workplace types your AI agent should target when auto-applying.</p></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block"><span className="mb-1.5 block text-xs font-extrabold text-ink-secondary">Preferred locations</span><input placeholder="e.g. Pune, Remote" className="w-full rounded-input border border-border bg-white px-3.5 py-3 text-sm" /></label>
                <label className="block"><span className="mb-1.5 block text-xs font-extrabold text-ink-secondary">Minimum salary</span><input placeholder="e.g. 800000" className="w-full rounded-input border border-border bg-white px-3.5 py-3 text-sm" /></label>
                <label className="block"><span className="mb-1.5 block text-xs font-extrabold text-ink-secondary">Workplace type</span>
                  <select className="w-full rounded-input border border-border bg-white px-3 py-3 text-sm"><option>Any</option><option>Remote</option><option>Hybrid</option><option>On-site</option></select></label>
                <label className="block"><span className="mb-1.5 block text-xs font-extrabold text-ink-secondary">Experience level</span>
                  <select className="w-full rounded-input border border-border bg-white px-3 py-3 text-sm"><option>Entry level</option><option>Mid level</option><option>Senior</option></select></label>
              </div>
            </div>
          )}

          {tab === "answers" && (
            <div className="mx-auto max-w-3xl">
              <div className="flex items-start gap-3 rounded-card bg-primary-soft/60 p-5"><MessageSquareText className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><p className="text-sm text-ink-secondary">Save answers to common application questions once — your AI agent reuses them to fill forms automatically.</p></div>
              <div className="mt-6 space-y-3">
                {["Why do you want to work here?", "What is your expected salary?", "Are you available to start immediately?", "Describe your ideal role.", "Do you have relevant certifications?"].map((q) => (
                  <div key={q} className="rounded-card border border-border bg-white p-4">
                    <p className="text-sm font-extrabold">{q}</p>
                    <textarea placeholder="Your answer…" className="mt-2 min-h-16 w-full rounded-input border border-border bg-surface-alt px-3 py-2.5 text-sm" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "rejections" && (
            <div className="mx-auto max-w-3xl">
              <div className="flex items-start gap-3 rounded-card bg-primary-soft/60 p-5"><Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><p className="text-sm text-ink-secondary">Track why applications were rejected so your AI agent can improve future matches.</p></div>
              <div className="mt-6 rounded-card border border-border bg-surface-alt p-10 text-center">
                <Bookmark className="mx-auto h-8 w-8 text-ink-muted" />
                <h3 className="mt-4 font-extrabold">No rejections recorded yet</h3>
                <p className="mt-1 text-sm text-ink-secondary">Rejection reasons will appear here as your agent applies to jobs.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
