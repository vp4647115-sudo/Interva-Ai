"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";

type Entry = { id: number; question: string; answer: string };

const STORE_KEY = "intervai-answer-library";

export default function AnswerLibraryPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try { setEntries(JSON.parse(window.localStorage.getItem(STORE_KEY) ?? "[]")); } catch { /* fresh */ }
    setReady(true);
  }, []);

  const persist = (next: Entry[]) => {
    setEntries(next);
    window.localStorage.setItem(STORE_KEY, JSON.stringify(next));
  };

  const add = () => {
    if (!question.trim() || !answer.trim()) return;
    persist([{ id: Date.now(), question: question.trim(), answer: answer.trim() }, ...entries]);
    setQuestion("");
    setAnswer("");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden shrink-0 md:block"><Sidebar /></div>
      <main className="min-w-0 flex-1 bg-[#fbfbfe]">
        <header className="border-b border-border bg-white px-5 py-6 sm:px-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-primary">Answer Library</h1>
          <p className="mt-2 text-sm text-ink-secondary">Pre-written answers to common application questions, ready to reuse.</p>
        </header>
        <div className="mx-auto max-w-4xl px-5 py-7 sm:px-8">
          <section className="rounded-card border border-border bg-white p-5 shadow-card sm:p-6">
            <h2 className="font-extrabold">Add a new answer</h2>
            <div className="mt-4 space-y-3">
              <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Question — e.g. Why do you want to work here?" aria-label="Question" className="w-full rounded-input border border-border bg-surface-alt px-3.5 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
              <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Your answer…" aria-label="Answer" className="min-h-28 w-full rounded-input border border-border bg-surface-alt px-3.5 py-3 text-sm leading-6 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
              <button onClick={add} disabled={!question.trim() || !answer.trim()} className="inline-flex items-center gap-2 rounded-pill bg-primary px-5 py-2.5 text-sm font-extrabold text-white disabled:opacity-40"><Plus className="h-4 w-4" /> Save answer</button>
            </div>
          </section>

          <div className="mt-6 space-y-3">
            {!ready ? null : entries.length === 0 ? (
              <p className="rounded-card bg-surface p-8 text-center text-sm text-ink-secondary shadow-card">No saved answers yet. Add your first one above.</p>
            ) : (
              entries.map((entry) => (
                <article key={entry.id} className="rounded-card border border-border bg-white p-5 shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-extrabold text-ink-primary">{entry.question}</h3>
                    <button onClick={() => persist(entries.filter((e) => e.id !== entry.id))} aria-label="Delete answer" className="shrink-0 rounded-lg p-1.5 text-ink-muted hover:bg-error-soft hover:text-error"><Trash2 className="h-4 w-4" /></button>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-ink-secondary">{entry.answer}</p>
                  <button onClick={() => { void navigator.clipboard.writeText(entry.answer); }} className="mt-3 text-xs font-extrabold text-primary hover:underline">Copy answer</button>
                </article>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
