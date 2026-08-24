"use client";

import { useState } from "react";
import { Copy, Loader2, Mail, Sparkles, WandSparkles } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import { generateCoverLetter } from "@/services/aiTools";

export default function CoverLettersPage() {
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [experience, setExperience] = useState("");
  const [tone, setTone] = useState<"professional" | "enthusiastic" | "concise">("professional");
  const [result, setResult] = useState<{ subject: string; body: string; highlights: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const res = await generateCoverLetter({ jobTitle, company, jobDescription, experience, tone });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cover letter generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(`${result.subject}\n\n${result.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canGenerate = jobTitle.trim() && company.trim();

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden shrink-0 md:block"><Sidebar /></div>
      <main className="min-w-0 flex-1 bg-[#fbfbfe]">
        <header className="border-b border-border bg-white px-5 py-6 sm:px-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-primary">Cover Letters</h1>
          <p className="mt-2 text-sm text-ink-secondary">Gemini writes a tailored letter from your real experience — never invented.</p>
        </header>
        <div className="mx-auto max-w-4xl px-5 py-7 sm:px-8">
          <section className="rounded-card border border-border bg-white p-5 shadow-card sm:p-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <label><span className="mb-1.5 block text-xs font-extrabold text-ink-secondary">Job title *</span><input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Backend Developer" className="w-full rounded-input border border-border bg-surface-alt px-3.5 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" /></label>
              <label><span className="mb-1.5 block text-xs font-extrabold text-ink-secondary">Company *</span><input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Corp" className="w-full rounded-input border border-border bg-surface-alt px-3.5 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" /></label>
            </div>
            <label className="mt-4 block"><span className="mb-1.5 block text-xs font-extrabold text-ink-secondary">Job description (optional)</span><textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} maxLength={6000} placeholder="Paste the posting so the letter targets its requirements…" className="min-h-28 w-full rounded-input border border-border bg-surface-alt px-3.5 py-3 text-sm leading-6 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" /></label>
            <label className="mt-4 block"><span className="mb-1.5 block text-xs font-extrabold text-ink-secondary">Your experience highlights (optional)</span><textarea value={experience} onChange={(e) => setExperience(e.target.value)} maxLength={4000} placeholder="e.g. 2 years building REST APIs with Java and Spring Boot…" className="min-h-24 w-full rounded-input border border-border bg-surface-alt px-3.5 py-3 text-sm leading-6 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" /></label>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
              <label><span className="mb-1.5 block text-xs font-extrabold text-ink-secondary">Tone</span>
                <select value={tone} onChange={(e) => setTone(e.target.value as typeof tone)} className="rounded-input border border-border bg-surface-alt px-3 py-2.5 text-sm">
                  <option value="professional">Professional</option><option value="enthusiastic">Enthusiastic</option><option value="concise">Concise</option>
                </select>
              </label>
              <button onClick={() => void generate()} disabled={!canGenerate || loading} className="inline-flex items-center gap-2 rounded-pill bg-primary px-6 py-3 text-sm font-extrabold text-white shadow-[0_3px_0_#4b31d1] disabled:opacity-40">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />} {loading ? "Writing…" : "Generate with AI"}
              </button>
            </div>
            {!canGenerate && <p className="mt-2 text-xs text-ink-muted">Add a job title and company to generate.</p>}
            {error && <p role="alert" className="mt-4 rounded-card bg-error-soft p-4 text-sm font-semibold text-error">{error}</p>}
          </section>

          {result && (
            <section className="mt-6 rounded-card border border-border bg-white p-5 shadow-card sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 font-extrabold"><Mail className="h-4 w-4 text-primary" /> {result.subject}</h2>
                <button onClick={() => void copy()} className="inline-flex items-center gap-1.5 rounded-pill border border-border px-3 py-1.5 text-xs font-extrabold text-ink-secondary hover:border-primary hover:text-primary"><Copy className="h-3.5 w-3.5" /> {copied ? "Copied" : "Copy"}</button>
              </div>
              <div className="mt-4 whitespace-pre-line text-sm leading-7 text-ink-secondary">{result.body}</div>
              {result.highlights.length > 0 && (
                <div className="mt-5 border-t border-border pt-4">
                  <h3 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-ink-secondary"><Sparkles className="h-3.5 w-3.5 text-primary" /> Points used from your background</h3>
                  <ul className="mt-2 space-y-1 text-sm text-ink-secondary">{result.highlights.map((h) => <li key={h}>• {h}</li>)}</ul>
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
