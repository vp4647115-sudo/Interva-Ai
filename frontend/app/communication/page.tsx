"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Mic, MicOff, Sparkles, TriangleAlert } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import RequireOnboarding from "@/components/auth/RequireOnboarding";
import { communicationApi, scoreLabel, type CommAnalysis, type CommMode, type CommSkill } from "@/services/communication";
import { useSpeechRecognition } from "@/lib/speech/useSpeechRecognition";

const CONSENT_KEY = "intervai-comm-consent";
const STARTER_QUESTIONS = [
  "Tell me about yourself.",
  "What project are you most proud of?",
  "Why are you interested in this role?",
];

async function speakQuestion(text: string) {
  try {
    const { getIdToken } = await import("@/lib/firebase/auth");
    const token = await getIdToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/communication/voice`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ text }),
    });
    if (response.ok) {
      const audio = new Audio(URL.createObjectURL(await response.blob()));
      await audio.play();
      return;
    }
  } catch {
    // Browser speech is the local fallback when ElevenLabs is not configured.
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  }
}

function CoachPage() {
  const [skills, setSkills] = useState<CommSkill[]>([]);
  const [modes, setModes] = useState<CommMode[]>([]);
  const [skill, setSkill] = useState("clarity");
  const [mode, setMode] = useState("free");
  const [sessionStarted, setSessionStarted] = useState(false);
  const [consented, setConsented] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [duration, setDuration] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<CommAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState(STARTER_QUESTIONS[0]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const speech = useSpeechRecognition((text) => setTranscript((t) => `${t} ${text}`.trim()));

  useEffect(() => {
    communicationApi.listSkills()
      .then((d) => { setSkills(d.skills); setModes(d.modes); })
      .catch(() => setError("Could not load the skill library."));
    setConsented(window.localStorage.getItem(CONSENT_KEY) === "true");
  }, []);

  // ── Auto cleanup on unmount or tab exit ──────────────────────────────

  useEffect(() => {
    return () => {
      speech.stop();
    };
  }, [speech]);

  useEffect(() => {
    if (speech.listening) {
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [speech.listening]);

  const beginSession = useCallback(() => {
    setSessionStarted(true);
    setResult(null);
    setError(null);
    setTranscript("");
    setDuration(0);
    void speakQuestion(question);
    speech.start();
  }, [question, speech]);

  const startWithConsent = () => {
    if (!consented) { setShowConsent(true); return; }
    beginSession();
  };

  const changeSkill = (nextSkill: string) => {
    if (speech.listening) return;
    setSkill(nextSkill);
    setSessionStarted(false);
    setResult(null);
  };

  const changeMode = (nextMode: string) => {
    if (speech.listening) return;
    setMode(nextMode);
    setSessionStarted(false);
    setResult(null);
  };

  const retryWithFeedback = () => {
    const nextQuestion = result?.nextQuestion || question;
    setQuestion(nextQuestion);
    setResult(null);
    setTranscript("");
    setDuration(0);
    setError(null);
    void speakQuestion(nextQuestion);
    speech.start();
  };

  const acceptConsent = () => {
    window.localStorage.setItem(CONSENT_KEY, "true");
    setConsented(true);
    setShowConsent(false);
    beginSession();
  };

  const stopAndAnalyze = async () => {
    speech.stop();
    if (!transcript.trim()) {
      setError("We couldn't hear your response. Check your microphone and try again.");
      return;
    }
    setAnalyzing(true);
    setError(null);
    try {
      const res = await communicationApi.analyze({ transcript, skill, mode, durationSeconds: duration });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI coaching is temporarily unavailable.");
    } finally {
      setAnalyzing(false);
    }
  };

  const mmss = `${String(Math.floor(duration / 60)).padStart(2, "0")}:${String(duration % 60).padStart(2, "0")}`;
  const activeSkill = skills.find((s) => s.id === skill);

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden shrink-0 md:block"><Sidebar /></div>
      <main className="min-w-0 flex-1 bg-[#fbfbfe]">
        <header className="border-b border-border bg-white px-5 py-6 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-primary"><Sparkles className="h-4 w-4" /> Build Communication</div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink-primary">AI Communication Coach</h1>
            <p className="mt-2 max-w-2xl text-sm text-ink-secondary">Improve the way you speak, listen, explain, respond, and communicate.</p>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8">
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-card bg-error-soft p-4 text-sm text-error" role="alert">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)_320px]">
            {/* Skill + mode selection */}
            <aside className="space-y-5">
              <div className="rounded-card border border-border bg-white p-5 shadow-card">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-ink-secondary">Training skill</h2>
                <div className="mt-3 space-y-1.5">
                  {skills.map((s) => (
                    <button key={s.id} type="button" onClick={() => changeSkill(s.id)} disabled={speech.listening}
                      className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${skill === s.id ? "bg-primary-soft text-primary" : "text-ink-secondary hover:bg-surface-alt"}`}>
                      {s.name} <span className="ml-1 text-[10px] font-semibold text-ink-muted">{s.category}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-card border border-border bg-white p-5 shadow-card">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-ink-secondary">Session mode</h2>
                <div className="mt-3 space-y-1.5">
                  {modes.map((m) => (
                    <button key={m.id} type="button" onClick={() => changeMode(m.id)} disabled={speech.listening}
                      className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${mode === m.id ? "bg-primary-soft text-primary" : "text-ink-secondary hover:bg-surface-alt"}`}>
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Live coach */}
            <section className="rounded-card border border-border bg-white p-6 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-ink-muted">Current skill</p>
                  <h2 className="text-xl font-extrabold text-ink-primary">{activeSkill?.name ?? "—"}</h2>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-xs font-extrabold ${speech.listening ? "bg-success-soft text-success" : "bg-surface-alt text-ink-secondary"}`}>
                    {speech.listening ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
                    {speech.listening ? "Listening" : "Microphone off"}
                  </span>
                  <span className="rounded-pill bg-ink-primary px-3 py-1.5 text-xs font-extrabold text-white tabular-nums">{mmss}</span>
                </div>
              </div>

              {!sessionStarted ? (
                <div className="mt-5 rounded-card border border-primary/20 bg-primary-soft/40 p-6">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-primary">Session setup</p>
                  <p className="mt-4 text-lg font-extrabold leading-7 text-ink-primary">“{question}”</p>
                  <p className="mt-2 text-sm leading-6 text-ink-secondary">
                    You are preparing a <strong className="text-ink-primary">{activeSkill?.name ?? "communication"}</strong> session in <strong className="text-ink-primary">{modes.find((m) => m.id === mode)?.name ?? "free conversation"}</strong> mode.
                  </p>
                  <button type="button" onClick={startWithConsent} className="mt-5 inline-flex items-center gap-2 rounded-pill bg-primary px-6 py-3 text-sm font-extrabold text-white shadow-[0_3px_0_#4b31d1] hover:bg-primary-hover">
                    <Mic className="h-4 w-4" /> Start Session
                  </button>
                </div>
              ) : <div className="mt-5 min-h-32 rounded-card bg-surface-alt p-4">
                <p className="text-xs font-extrabold uppercase tracking-wider text-ink-muted">Live transcript</p>
                <p className="mt-2 text-sm font-extrabold text-primary">Question: {question}</p>
                <p className="mt-2 text-sm leading-7 text-ink-primary">
                  {transcript || <span className="text-ink-muted">Your spoken words appear here…</span>}
                  {speech.interim && <span className="text-ink-muted"> {speech.interim}</span>}
                </p>
              </div>}

              {sessionStarted && <div className="mt-5 flex flex-wrap gap-3">
                {!speech.listening ? (
                  <button type="button" onClick={startWithConsent} className="inline-flex items-center gap-2 rounded-pill bg-primary px-6 py-3 text-sm font-extrabold text-white shadow-[0_3px_0_#4b31d1] hover:bg-primary-hover">
                    <Mic className="h-4 w-4" /> Start Speaking
                  </button>
                ) : (
                  <button type="button" onClick={() => void stopAndAnalyze()} disabled={analyzing} className="inline-flex items-center gap-2 rounded-pill bg-ink-primary px-6 py-3 text-sm font-extrabold text-white disabled:opacity-50">
                    {analyzing ? "AI coach is analyzing…" : "Stop & Get Feedback"}
                  </button>
                )}
                {transcript && !speech.listening && (
                  <button type="button" onClick={() => { setTranscript(""); setDuration(0); setResult(null); }} className="rounded-pill border border-border px-5 py-3 text-sm font-bold text-ink-secondary hover:border-primary hover:text-primary">Reset</button>
                )}
              </div>}

              {sessionStarted && speech.error && <p className="mt-4 text-sm text-error" role="alert">{speech.error}</p>}
              {sessionStarted && !speech.supported && <p className="mt-4 text-sm text-warning">Speech recognition needs Chrome or Edge. Your transcript can also be typed manually below.</p>}
              {sessionStarted && !speech.supported && (
                <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder="Type what you would say…" className="mt-3 min-h-24 w-full rounded-input border border-border bg-surface-alt px-3.5 py-3 text-sm" />
              )}
            </section>

            {/* Results / coaching */}
            <aside className="space-y-5">
              {analyzing && (
                <div className="rounded-card border border-border bg-white p-6 text-center shadow-card">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
                  <p className="mt-4 text-sm font-bold text-ink-secondary">Gemini is analyzing your response…</p>
                </div>
              )}

              {result && !analyzing && (
                <>
                  {(result.correction || result.betterVersion) && (
                    <div className="rounded-card border border-primary/30 bg-primary-soft/50 p-5 shadow-card">
                      <p className="text-xs font-extrabold uppercase tracking-wider text-primary">Coach lesson</p>
                      {result.correction && <p className="mt-3 text-sm font-extrabold leading-6 text-ink-primary">{result.correction}</p>}
                      {result.explanation && <p className="mt-2 text-sm leading-6 text-ink-secondary">{result.explanation}</p>}
                      {result.betterVersion && (
                        <div className="mt-4 border-l-2 border-primary pl-3">
                          <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink-muted">Try saying it like this</p>
                          <p className="mt-1 text-sm italic leading-6 text-ink-primary">“{result.betterVersion}”</p>
                        </div>
                      )}
                      <button type="button" onClick={retryWithFeedback} className="mt-5 inline-flex items-center gap-2 rounded-pill bg-primary px-5 py-2.5 text-sm font-extrabold text-white hover:bg-primary-hover">
                        Try again <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <div className="rounded-card bg-ink-primary p-6 text-white shadow-card">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-white/60">Your communication score</p>
                    <div className="mt-3 flex items-end gap-2"><span className="text-5xl font-extrabold">{result.overallScore}</span><span className="mb-1 text-sm text-white/60">/ 100</span></div>
                    <p className="mt-2 text-sm font-bold text-pink-accent">{scoreLabel(result.overallScore)}</p>
                  </div>

                  <div className="rounded-card border border-border bg-white p-5 shadow-card">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-ink-secondary">Skill breakdown</h3>
                    <div className="mt-3 space-y-2.5">
                      {Object.entries(result.skills).map(([k, v]) => (
                        <div key={k}>
                          <div className="flex justify-between text-xs font-bold"><span className="capitalize text-ink-secondary">{k}</span><span>{v}%</span></div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-border/60"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${v}%` }} /></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {result.coachMessage && (
                    <div className="rounded-card border border-primary/30 bg-primary-soft/50 p-5">
                      <p className="text-sm leading-6 text-ink-primary"><span className="font-extrabold">Coach: </span>{result.coachMessage}</p>
                    </div>
                  )}

                  <div className="rounded-card border border-border bg-white p-5 shadow-card">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-success">What you did well</h3>
                    <ul className="mt-2 space-y-1.5 text-sm text-ink-secondary">{result.strengths.map((s) => <li key={s}>✓ {s}</li>)}</ul>
                    <h3 className="mt-4 text-xs font-extrabold uppercase tracking-wider text-warning">What to improve</h3>
                    <ul className="mt-2 space-y-1.5 text-sm text-ink-secondary">{result.weaknesses.map((w) => <li key={w}>• {w}</li>)}</ul>
                  </div>

                  <div className="rounded-card border border-border bg-white p-5 shadow-card">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-ink-secondary">Next exercise</h3>
                    <p className="mt-2 text-sm leading-6 text-ink-primary">{result.nextExercise.instruction}</p>
                    <button type="button" onClick={retryWithFeedback} className="mt-4 inline-flex items-center gap-2 rounded-pill bg-primary px-5 py-2.5 text-sm font-extrabold text-white hover:bg-primary-hover">Next question <ArrowRight className="h-4 w-4" /></button>
                  </div>

                  <Link href="/communication/progress" className="block rounded-pill border border-border py-3 text-center text-sm font-extrabold text-ink-secondary hover:border-primary hover:text-primary">View progress →</Link>
                </>
              )}

              {!result && !analyzing && (
                <div className="rounded-card border border-border bg-white p-6 shadow-card">
                  <h3 className="font-extrabold text-ink-primary">How it works</h3>
                  <ol className="mt-3 space-y-2 text-sm leading-6 text-ink-secondary">
                    <li>1. Choose a training option.</li>
                    <li>2. Choose a session mode.</li>
                    <li>3. Start the session and respond naturally.</li>
                    <li>4. Stop when ready for evidence-based feedback.</li>
                    <li>5. Practice again and track your progress.</li>
                  </ol>
                  <Link href="/communication/progress" className="mt-4 block text-sm font-extrabold text-primary hover:underline">View your progress →</Link>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>

      {showConsent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-primary/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-modal bg-white p-8 shadow-modal">
            <h2 className="text-xl font-extrabold text-ink-primary">Communication Training Privacy</h2>
            <p className="mt-3 text-sm leading-6 text-ink-secondary">
              Your microphone will be used during the practice session so the AI can analyze your speech and provide feedback.
              Your speech is transcribed in your browser and the transcript is sent to Gemini for coaching. Audio is never recorded or stored.
            </p>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={acceptConsent} className="flex-1 rounded-pill bg-primary py-3 text-sm font-extrabold text-white hover:bg-primary-hover">Start Practice</button>
              <button type="button" onClick={() => setShowConsent(false)} className="rounded-pill border border-border px-5 py-3 text-sm font-bold text-ink-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CommunicationPage() {
  return (
    <RequireOnboarding>
      <CoachPage />
    </RequireOnboarding>
  );
}
