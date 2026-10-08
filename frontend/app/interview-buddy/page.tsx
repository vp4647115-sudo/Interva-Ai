"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Mic, MicOff, Send, Sparkles } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import { askBuddy, getMockQuestion } from "@/services/aiTools";
import { communicationApi, type CommAnalysis } from "@/services/communication";
import { useSpeechRecognition } from "@/lib/speech/useSpeechRecognition";

type Message = { role: "user" | "assistant"; content: string; tips?: string[] };

export default function InterviewBuddyPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingQuestion, setGeneratingQuestion] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [practiceQuestion, setPracticeQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [analysis, setAnalysis] = useState<CommAnalysis | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const speechStartedAt = useRef<number | null>(null);
  const { listening, interim, supported, start, stop, error: voiceHookError } = useSpeechRecognition((text) => {
    setAnswer((prev) => (prev ? `${prev} ${text}` : text));
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (listening) {
      speechStartedAt.current = Date.now();
    } else if (speechStartedAt.current !== null) {
      setDurationSeconds((previous) => previous + Math.round((Date.now() - speechStartedAt.current!) / 1000));
      speechStartedAt.current = null;
    }
  }, [listening]);

  const handleInstallBuddy = () => {
    const link = document.createElement("a");
    link.href = "/buddy-extension.zip";
    link.download = "interv-ai-buddy-extension.zip";
    link.click();
  };

  const handleRunBuddy = () => {
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      document.querySelector<HTMLInputElement>("#practice-question")?.focus();
    }, 50);
  };

  const toggleVoice = () => {
    if (listening) {
      stop();
    } else {
      start();
    }
  };

  const analyzeAnswer = async () => {
    if (!practiceQuestion.trim() || !answer.trim() || analyzing) return;
    setError(null);
    setAnalysis(null);
    setAnalyzing(true);
    try {
      const result = await communicationApi.analyze({
        transcript: answer.trim(),
        question: practiceQuestion.trim(),
        targetRole,
        skill: "interview-communication",
        mode: "interview",
        durationSeconds,
      });
      setAnalysis(result);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Answer analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleScreenShare = async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setError("Screen sharing requires Chrome or Edge.");
      return;
    }

    if (screenSharing && screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
      setScreenSharing(false);
      setScreenTranscript("");
      stop();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: 30,
          cursor: "always",
        } as MediaTrackConstraints,
        audio: true,
      });

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          setScreenStream(null);
          setScreenSharing(false);
          setScreenTranscript("");
          stop();
        };
      }

      setScreenStream(stream);
      setScreenSharing(true);
      setError(null);
      setScreenTranscript("Screen share is live. Your transcript will appear here.");

      if (supported) {
        start();
      } else {
        setError("Your browser does not support speech recognition. Try Chrome or Edge.");
      }
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Unable to share your screen.";
      setError(message);
    }
  };

  const generatePracticeQuestion = async () => {
    if (generatingQuestion) return;
    setError(null);
    setAnalysis(null);
    setGeneratingQuestion(true);
    try {
      const result = await getMockQuestion({ role: targetRole.trim() || "General", difficulty: "medium", interviewType: "mixed" });
      setPracticeQuestion(result.question);
      setAnswer("");
      setDurationSeconds(0);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not generate an interview question.");
    } finally {
      setGeneratingQuestion(false);
    }
  };

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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-ink-primary">Interview Buddy</h1>
              <p className="mt-2 text-sm text-ink-secondary">Ask anything — get model answers and coaching from AI.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleRunBuddy}
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
              >
                Run Buddy
              </button>
              <button
                type="button"
                onClick={handleInstallBuddy}
                className="rounded-full border border-border bg-surface-alt px-4 py-2 text-sm font-semibold text-ink-primary transition hover:border-primary hover:text-primary"
              >
                Download extension
              </button>
              <a href="/extension/README.md" target="_blank" rel="noreferrer" className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink-primary hover:border-primary hover:text-primary">Install guide</a>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p className="text-sm text-ink-secondary">Practice reviews use the Interview Communication skill.</p>
            <input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="Target role (optional) — e.g. Java Developer" className="w-full max-w-md rounded-input border border-border bg-surface-alt px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
          </div>

          <section id="practice" className="mt-5 rounded-card border border-border bg-white p-4 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">Interview practice</p>
                <h2 className="mt-1 text-lg font-extrabold text-ink-primary">Answer, review, retry</h2>
              </div>
              <button type="button" onClick={toggleVoice} disabled={!supported} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white ${listening ? "bg-red-500" : "bg-ink-secondary"}`}>
                {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {listening ? "Stop dictation" : "Dictate answer"}
              </button>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="practice-question" className="text-sm font-semibold text-ink-primary">Interview question</label>
              <button type="button" onClick={() => void generatePracticeQuestion()} disabled={generatingQuestion} className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs font-semibold text-ink-primary disabled:opacity-50">
                {generatingQuestion && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {generatingQuestion ? "Generating" : "Generate question"}
              </button>
            </div>
            <input id="practice-question" value={practiceQuestion} onChange={(event) => { setPracticeQuestion(event.target.value); setAnalysis(null); }} placeholder="Paste a question or practice a generated one" className="mt-2 w-full rounded-input border border-border bg-surface-alt px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
            <label htmlFor="practice-answer" className="mt-4 block text-sm font-semibold text-ink-primary">Your answer</label>
            <textarea id="practice-answer" value={answer} onChange={(event) => { setAnswer(event.target.value); setAnalysis(null); }} rows={5} placeholder="Type or dictate your response..." className="mt-2 w-full resize-y rounded-input border border-border bg-surface-alt px-3.5 py-2.5 text-sm leading-6 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
            {interim && <p className="mt-2 text-xs text-ink-secondary">Listening: {interim}</p>}
            {voiceHookError && <p role="alert" className="mt-2 text-xs font-semibold text-error">{voiceHookError}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => void analyzeAnswer()} disabled={analyzing || !practiceQuestion.trim() || !answer.trim()} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                {analyzing && <Loader2 className="h-4 w-4 animate-spin" />}
                {analyzing ? "Analyzing answer" : "Analyze answer"}
              </button>
              <button type="button" onClick={() => { setAnswer(""); setDurationSeconds(0); setAnalysis(null); }} className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink-primary">Clear answer</button>
            </div>
            {analysis && (
              <div className="mt-5 border-t border-border pt-4">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="text-lg font-bold text-ink-primary">{analysis.overallScore}/100</h3>
                  <p className="text-sm font-semibold text-ink-secondary">{analysis.questionAnswered === null ? "Answer review" : analysis.questionAnswered ? "Answered the question" : "Did not fully answer the question"}</p>
                </div>
                {analysis.questionAssessment && <p className="mt-2 text-sm leading-6 text-ink-secondary">{analysis.questionAssessment}</p>}
                <p className="mt-3 text-sm font-semibold text-ink-primary">{analysis.coachMessage}</p>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div><h4 className="text-xs font-bold uppercase text-primary">Strengths</h4><ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-ink-secondary">{analysis.strengths.map((item) => <li key={item}>{item}</li>)}</ul></div>
                  <div><h4 className="text-xs font-bold uppercase text-primary">Next improvements</h4><ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-ink-secondary">{analysis.weaknesses.map((item) => <li key={item}>{item}</li>)}</ul></div>
                </div>
                <h4 className="mt-4 text-xs font-bold uppercase text-primary">Communication scores</h4>
                <div className="mt-2 flex flex-wrap gap-2">{Object.entries(analysis.skills).map(([skill, score]) => <span key={skill} className="rounded border border-border bg-surface-alt px-2 py-1 text-xs text-ink-primary">{skill}: {score}</span>)}</div>
                <div className="mt-4 rounded-card bg-surface-alt p-3">
                  <p className="text-xs font-bold uppercase text-primary">Stronger version</p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-ink-primary">{analysis.betterVersion}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => setAnswer(analysis.betterVersion)} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white">Use stronger version</button>
                  <button type="button" onClick={() => { setPracticeQuestion(analysis.nextQuestion); setAnswer(""); setDurationSeconds(0); setAnalysis(null); }} className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink-primary">Practice follow-up</button>
                </div>
              </div>
            )}
          </section>
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
          <form onSubmit={(e) => { e.preventDefault(); void send(); }} className="mx-auto flex max-w-3xl gap-2 relative">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask your interview question…" aria-label="Ask Interview Buddy" className="flex-1 rounded-pill border border-border bg-surface-alt px-5 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
            <button type="submit" disabled={!input.trim() || loading} aria-label="Send" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white disabled:opacity-40"><Send className="h-4 w-4" /></button>
          </form>
        </div>
      </main>
    </div>
  );
}
