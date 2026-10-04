"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Mic, MicOff, MonitorUp, Send, Sparkles } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import { askBuddy } from "@/services/aiTools";
import { useSpeechRecognition } from "@/lib/speech/useSpeechRecognition";

type Message = { role: "user" | "assistant"; content: string; tips?: string[] };

export default function InterviewBuddyPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBuddyRunning, setIsBuddyRunning] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [screenTranscript, setScreenTranscript] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const { listening, interim, supported, start, stop, error: voiceHookError } = useSpeechRecognition((text) => {
    setInput((prev) => (prev ? prev + " " + text : text));
    setScreenTranscript((prev) => (prev ? `${prev}\n${text}` : text));
  });

  useEffect(() => {
    if (!screenVideoRef.current) return;
    if (screenStream) {
      screenVideoRef.current.srcObject = screenStream;
      void screenVideoRef.current.play().catch(() => undefined);
      return;
    }
    screenVideoRef.current.srcObject = null;
  }, [screenStream]);

  useEffect(() => {
    if (!screenSharing && listening) {
      stop();
    }
  }, [screenSharing, listening, stop]);

  const handleInstallBuddy = () => {
    const link = document.createElement("a");
    link.href = "/buddy-extension.zip";
    link.download = "interv-ai-buddy-extension.zip";
    link.click();
  };

  const handleRunBuddy = () => {
    setIsBuddyRunning(true);
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      const inputEl = document.querySelector<HTMLInputElement>('input[aria-label="Ask Interview Buddy"]');
      inputEl?.focus();
    }, 50);
  };

  const toggleVoice = () => {
    if (listening) {
      stop();
    } else {
      start();
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
        video: { frameRate: 30, cursor: "always" },
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
                Install Buddy
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${isBuddyRunning ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
              <span className={`h-2 w-2 rounded-full ${isBuddyRunning ? "bg-emerald-500" : "bg-slate-500"}`} />
              {isBuddyRunning ? "Buddy running" : "Buddy paused"}
            </div>
            <input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="Target role (optional) — e.g. Java Developer" className="w-full max-w-md rounded-input border border-border bg-surface-alt px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
          </div>

          <div className="mt-5 rounded-card border border-border bg-white p-4 shadow-card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">Screen mode</p>
                <h2 className="mt-1 text-lg font-extrabold text-ink-primary">Share my screen</h2>
              </div>
              <button
                type="button"
                onClick={() => void toggleScreenShare()}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${screenSharing ? "bg-red-500 text-white" : "bg-primary text-white"}`}
              >
                <MonitorUp className="h-4 w-4" />
                {screenSharing ? "Stop sharing" : "Share my screen"}
              </button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-[1.3fr_0.7fr]">
              <div className="flex min-h-[190px] items-center justify-center overflow-hidden rounded-card border border-border bg-slate-50">
                {screenSharing && screenStream ? (
                  <video ref={screenVideoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
                ) : (
                  <p className="max-w-xs text-center text-sm text-ink-secondary">Enable screen share to let Interview Buddy view your screen and transcribe your responses.</p>
                )}
              </div>

              <div className="rounded-card border border-border bg-surface-alt p-3">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-ink-secondary">Live transcript</p>
                <div className="mt-3 min-h-[150px] whitespace-pre-line text-sm leading-6 text-ink-primary">
                  {screenTranscript || (screenSharing ? "Listening for your answer…" : "Transcript will appear here when screen share is active.")}
                </div>
              </div>
            </div>
          </div>
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
          {voiceHookError && <p role="alert" className="mx-auto mb-2 max-w-3xl rounded-card bg-error-soft p-2 text-xs font-semibold text-error">{voiceHookError}</p>}
          <form onSubmit={(e) => { e.preventDefault(); void send(); }} className="mx-auto flex max-w-3xl gap-2 relative">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask your interview question…" aria-label="Ask Interview Buddy" className="flex-1 rounded-pill border border-border bg-surface-alt px-5 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
            {interim && <span className="absolute left-5 -top-6 text-xs text-ink-secondary">{interim}</span>}
            <button type="button" onClick={toggleVoice} disabled={supported === false} aria-label={listening ? "Stop voice" : "Start voice"} className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white ${supported === false ? "opacity-40" : ""} ${listening ? "bg-red-500 animate-pulse" : "bg-ink-secondary"}`} title={supported ? (listening ? "Stop listening" : "Voice type") : "Voice not supported"}>
              {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
            <button type="submit" disabled={!input.trim() || loading} aria-label="Send" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white disabled:opacity-40"><Send className="h-4 w-4" /></button>
          </form>
        </div>
      </main>
    </div>
  );
}
