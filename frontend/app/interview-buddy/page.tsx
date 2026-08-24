"use client";

import { useRef, useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import { askBuddy } from "@/services/aiTools";

type Message = { role: "user" | "assistant"; content: string; tips?: string[] };

export default function InterviewBuddyPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const send = async () => {
    const question = input.trim();
    if (!question || loading) return;
    setInput("");
    setError(null);
    setMessages((m) => [...m, { role: "user", content: question }]);
    setLoading(true);
    try {
      const res = await askBuddy({
        question,
        targetRole,
        history: messages.map((m) => ({ role: m.role, content: m.content })),
      });
      setMessages((m) => [...m, { role: "assistant", content: res.answer, tips: res.tips }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI request failed.");
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden shrink-0 md:block"><Sidebar /></div>
      <main className="flex min-w-0 flex-1 flex-col bg-[#fbfbfe]">
        <header className="border-b border-border bg-white px-5 py-6 sm:px-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-primary">Interview Buddy</h1>
          <p className="mt-2 text-sm text-ink-secondary">Ask anything — get model answers and coaching from AI.</p>
          <input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="Target role (optional) — e.g. Java Developer" className="mt-3 w-full max-w-md rounded-input border border-border bg-surface-alt px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
        </header>

        <div className="mx-auto w-full max-w-3xl flex-1 space-y-4 overflow-y-auto px-5 py-7 sm:px-8">
          {messages.length === 0 && (
            <div className="rounded-card bg-surface p-10 text-center shadow-card">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft"><Sparkles className="h-6 w-6 text-primary" /></span>
              <h2 className="mt-5 text-lg font-extrabold">How can I help you prepare?</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-ink-secondary">Try: “How do I explain a project I built?”, “What is the STAR method?”, or “Give me a model answer for ‘what’s your weakness’.”</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-card px-5 py-4 text-sm leading-6 ${m.role === "user" ? "bg-primary text-white" : "border border-border bg-white shadow-card text-ink-primary"}`}>
                <p className="whitespace-pre-line">{m.content}</p>
                {m.tips && m.tips.length > 0 && (
                  <div className="mt-3 border-t border-border pt-3">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-primary">Coach tips</p>
                    <ul className="mt-1.5 space-y-1 text-ink-secondary">{m.tips.map((t) => <li key={t}>• {t}</li>)}</ul>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && <div className="flex justify-start"><div className="flex items-center gap-2 rounded-card border border-border bg-white px-5 py-4 text-sm text-ink-secondary shadow-card"><Loader2 className="h-4 w-4 animate-spin text-primary" /> Thinking…</div></div>}
          {error && <p role="alert" className="rounded-card bg-error-soft p-4 text-sm font-semibold text-error">{error}</p>}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-border bg-white px-5 py-4 sm:px-8">
          <form onSubmit={(e) => { e.preventDefault(); void send(); }} className="mx-auto flex max-w-3xl gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask your interview question…" aria-label="Ask Interview Buddy" className="flex-1 rounded-pill border border-border bg-surface-alt px-5 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
            <button type="submit" disabled={!input.trim() || loading} aria-label="Send" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white disabled:opacity-40"><Send className="h-4 w-4" /></button>
          </form>
        </div>
      </main>
    </div>
  );
}
