"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Play, Sparkles, TriangleAlert } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import { evaluateMockAnswer, getMockQuestion } from "@/services/aiTools";

type Phase = "setup" | "active" | "feedback";

export default function MockInterviewsPage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [role, setRole] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [interviewType, setInterviewType] = useState<"technical" | "behavioral" | "mixed">("technical");
  const [question, setQuestion] = useState("");
  const [topic, setTopic] = useState("");
  const [lookFors, setLookFors] = useState<string[]>([]);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<{ score: number; verdict: string; strengths: string[]; improvements: string[]; missedConcepts: string[]; followUpQuestion: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    if (!role.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const res = await getMockQuestion({ role: role.trim(), difficulty, interviewType });
      setQuestion(res.question);
      setTopic(res.topic);
      setLookFors(res.whatWeLookFor);
      setAnswer("");
      setEvaluation(null);
      setPhase("active");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start the interview.");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const res = await evaluateMockAnswer({ role: role.trim(), question, answer: answer.trim(), difficulty });
      setEvaluation(res);
      setPhase("feedback");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Evaluation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden shrink-0 md:block"><Sidebar /></div>
      <main className="min-w-0 flex-1 bg-[#fbfbfe]">
        <header className="border-b border-border bg-white px-5 py-6 sm:px-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-primary">Mock Interviews</h1>
          <p className="mt-2 text-sm text-ink-secondary">Practice with an AI interviewer and get scored, evidence-based feedback.</p>
        </header>

        <div className="mx-auto max-w-3xl px-5 py-7 sm:px-8">
          {error && <p role="alert" className="mb-5 flex items-start gap-2 rounded-card bg-error-soft p-4 text-sm font-semibold text-error"><TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" /> {error}</p>}

          {phase === "setup" && (
            <section className="rounded-card border border-border bg-white p-6 shadow-card sm:p-8">
              <h2 className="text-xl font-extrabold">Set up your interview</h2>
              <label className="mt-5 block"><span className="mb-1.5 block text-xs font-extrabold text-ink-secondary">Target role *</span><input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Backend Developer" className="w-full rounded-input border border-border bg-surface-alt px-3.5 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" /></label>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label><span className="mb-1.5 block text-xs font-extrabold text-ink-secondary">Difficulty</span>
                  <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as typeof difficulty)} className="w-full rounded-input border border-border bg-surface-alt px-3 py-3 text-sm"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select>
                </label>
                <label><span className="mb-1.5 block text-xs font-extrabold text-ink-secondary">Type</span>
                  <select value={interviewType} onChange={(e) => setInterviewType(e.target.value as typeof interviewType)} className="w-full rounded-input border border-border bg-surface-alt px-3 py-3 text-sm"><option value="technical">Technical</option><option value="behavioral">Behavioral</option><option value="mixed">Mixed</option></select>
                </label>
              </div>
              <button onClick={() => void start()} disabled={!role.trim() || loading} className="mt-6 inline-flex items-center gap-2 rounded-pill bg-primary px-6 py-3 text-sm font-extrabold text-white shadow-[0_3px_0_#4b31d1] disabled:opacity-40">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} {loading ? "Preparing…" : "Start interview"}
              </button>
            </section>
          )}

          {phase === "active" && (
            <section className="rounded-card border border-border bg-white p-6 shadow-card sm:p-8">
              <span className="rounded-pill bg-primary-soft px-3 py-1 text-xs font-extrabold text-primary">{topic || "Interview question"}</span>
              <h2 className="mt-4 text-xl font-extrabold leading-8">{question}</h2>
              {lookFors.length > 0 && (
                <details className="mt-3 text-sm text-ink-secondary"><summary className="cursor-pointer font-bold text-primary">What a strong answer covers</summary><ul className="mt-2 space-y-1">{lookFors.map((l) => <li key={l}>• {l}</li>)}</ul></details>
              )}
              <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Type your answer as you would say it aloud…" className="mt-5 min-h-48 w-full rounded-input border border-border bg-surface-alt px-3.5 py-3 text-sm leading-6 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
              <button onClick={() => void submitAnswer()} disabled={!answer.trim() || loading} className="mt-4 inline-flex items-center gap-2 rounded-pill bg-primary px-6 py-3 text-sm font-extrabold text-white shadow-[0_3px_0_#4b31d1] disabled:opacity-40">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} {loading ? "Evaluating…" : "Submit answer"}
              </button>
            </section>
          )}

          {phase === "feedback" && evaluation && (
            <section className="space-y-5">
              <div className="rounded-card bg-ink-primary p-7 text-center text-white shadow-card">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/60">Your score</p>
                <p className="mt-3 text-6xl font-extrabold">{evaluation.score}<span className="text-2xl text-white/60">/100</span></p>
                <p className="mt-3 text-sm text-white/80">{evaluation.verdict}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-card border border-border bg-white p-5 shadow-card">
                  <h3 className="flex items-center gap-2 font-extrabold text-success"><CheckCircle2 className="h-4 w-4" /> Strengths</h3>
                  <ul className="mt-3 space-y-1.5 text-sm text-ink-secondary">{evaluation.strengths.map((s) => <li key={s}>• {s}</li>)}</ul>
                </div>
                <div className="rounded-card border border-border bg-white p-5 shadow-card">
                  <h3 className="flex items-center gap-2 font-extrabold text-warning"><TriangleAlert className="h-4 w-4" /> Improve</h3>
                  <ul className="mt-3 space-y-1.5 text-sm text-ink-secondary">{evaluation.improvements.map((s) => <li key={s}>• {s}</li>)}</ul>
                </div>
              </div>
              {evaluation.missedConcepts.length > 0 && (
                <div className="rounded-card border border-warning/40 bg-warning-soft p-5">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-warning">Concepts you missed</h3>
                  <div className="mt-2 flex flex-wrap gap-2">{evaluation.missedConcepts.map((c) => <span key={c} className="rounded-pill bg-white px-3 py-1 text-xs font-bold text-ink-secondary">{c}</span>)}</div>
                </div>
              )}
              <div className="rounded-card border border-border bg-white p-5 shadow-card">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-ink-secondary">Follow-up question</h3>
                <p className="mt-2 font-bold">{evaluation.followUpQuestion}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => void submitAnswer()} disabled={!answer.trim() || loading} className="rounded-pill border border-border px-5 py-2.5 text-sm font-extrabold text-ink-secondary hover:border-primary hover:text-primary">Re-evaluate</button>
                <button onClick={() => { setPhase("setup"); setEvaluation(null); }} className="rounded-pill bg-primary px-5 py-2.5 text-sm font-extrabold text-white">New question</button>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
