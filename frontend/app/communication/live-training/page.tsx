"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CameraOff,
  MessageSquare,
  Mic,
  MicOff,
  Radio,
  Sparkles,
  Square,
  TriangleAlert,
  Volume2,
} from "lucide-react";
import RequireOnboarding from "@/components/auth/RequireOnboarding";
import Sidebar from "@/components/dashboard/Sidebar";
import {
  communicationApi,
  scoreLabel,
  type CommAnalysis,
  type CommMode,
  type CommSkill,
  type LiveSessionResult,
} from "@/services/communication";
import { useGeminiLive, type GeminiLiveTranscript } from "@/lib/speech/useGeminiLive";
import { useCameraStream } from "@/lib/speech/useCameraStream";
import { useFaceEmotionScanner } from "@/lib/speech/useFaceEmotionScanner";

// ── Constants ─────────────────────────────────────────────────────────────

const STARTER_QUESTIONS = [
  "Tell me about yourself.",
  "What project are you most proud of?",
  "Why are you interested in this role?",
  "Describe a challenge you overcame at work.",
  "How do you handle pressure or tight deadlines?",
];

// ── AI Avatar ─────────────────────────────────────────────────────────────

function AiAvatar({ speaking, audioLevel }: { speaking: boolean; audioLevel: number }) {
  const scale = speaking ? 1 + audioLevel * 0.35 : 1;
  const glowOpacity = speaking ? 0.3 + audioLevel * 0.5 : 0.15;
  const ringScale1 = speaking ? 1.2 + audioLevel * 0.4 : 1;
  const ringScale2 = speaking ? 1.4 + audioLevel * 0.6 : 1;
  const ringScale3 = speaking ? 1.6 + audioLevel * 0.8 : 1;

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow */}
      <div
        className="absolute h-56 w-56 rounded-full transition-all duration-300"
        style={{
          background: `radial-gradient(circle, rgba(108,76,255,${glowOpacity}) 0%, transparent 70%)`,
          transform: `scale(${ringScale3})`,
        }}
      />

      {/* Ring 3 */}
      <div
        className="absolute h-44 w-44 rounded-full border border-primary/20 transition-all duration-200"
        style={{ transform: `scale(${ringScale3})`, opacity: speaking ? 0.4 : 0.1 }}
      />

      {/* Ring 2 */}
      <div
        className="absolute h-36 w-36 rounded-full border-2 border-primary/30 transition-all duration-200"
        style={{ transform: `scale(${ringScale2})`, opacity: speaking ? 0.5 : 0.15 }}
      />

      {/* Ring 1 */}
      <div
        className="absolute h-28 w-28 rounded-full border-2 border-primary/40 transition-all duration-150"
        style={{ transform: `scale(${ringScale1})`, opacity: speaking ? 0.6 : 0.2 }}
      />

      {/* Core orb */}
      <div
        className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full shadow-lg transition-transform duration-150"
        style={{
          background: "linear-gradient(135deg, #6C4CFF 0%, #F72585 50%, #6C4CFF 100%)",
          backgroundSize: "200% 200%",
          animation: speaking ? "avatar-gradient 3s ease infinite" : "avatar-gradient 8s ease infinite",
          transform: `scale(${scale})`,
        }}
      >
        <div
          className="h-8 w-8 rounded-full bg-white/30 backdrop-blur-sm transition-all duration-200"
          style={{ transform: `scale(${speaking ? 0.8 + audioLevel * 0.4 : 0.7})` }}
        />
      </div>

      <style jsx>{`
        @keyframes avatar-gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}

// ── Chat message bubble ───────────────────────────────────────────────────

function ChatBubble({ msg }: { msg: GeminiLiveTranscript }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${
          isUser
            ? "rounded-br-md bg-primary text-white"
            : "rounded-bl-md bg-surface-alt text-ink-primary"
        }`}
      >
        <p className="text-[10px] font-extrabold uppercase tracking-wider opacity-60 mb-1">
          {isUser ? "You" : "AI Coach"}
        </p>
        {msg.text}
      </div>
    </div>
  );
}

// ── Score results panel ───────────────────────────────────────────────────

function ScorePanel({
  result,
  onRetry,
}: {
  result: CommAnalysis | LiveSessionResult;
  onRetry?: () => void;
}) {
  const overall = result.overallScore ?? 0;
  const skills = result.skills ?? {};
  const strengths = result.strengths ?? [];
  const weaknesses = result.weaknesses ?? [];
  const coachMessage = "coachMessage" in result ? result.coachMessage : undefined;
  const correction = "correction" in result ? result.correction : undefined;
  const explanation = "explanation" in result ? result.explanation : undefined;
  const betterVersion = "betterVersion" in result ? result.betterVersion : undefined;
  const nextExercise = result.nextExercise;

  return (
    <div className="space-y-5">
      {/* Coach lesson */}
      {(correction || betterVersion) && (
        <div className="rounded-card border border-primary/30 bg-primary-soft/50 p-5 shadow-card">
          <p className="text-xs font-extrabold uppercase tracking-wider text-primary">Coach lesson</p>
          {correction && (
            <p className="mt-3 text-sm font-extrabold leading-6 text-ink-primary">{correction}</p>
          )}
          {explanation && (
            <p className="mt-2 text-sm leading-6 text-ink-secondary">{explanation}</p>
          )}
          {betterVersion && (
            <div className="mt-4 border-l-2 border-primary pl-3">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink-muted">
                Try saying it like this
              </p>
              <p className="mt-1 text-sm italic leading-6 text-ink-primary">&quot;{betterVersion}&quot;</p>
            </div>
          )}
        </div>
      )}

      {/* Overall score */}
      <div className="rounded-card bg-ink-primary p-6 text-white shadow-card">
        <p className="text-xs font-extrabold uppercase tracking-wider text-white/60">
          Your communication score
        </p>
        <div className="mt-3 flex items-end gap-2">
          <span className="text-5xl font-extrabold">{overall}</span>
          <span className="mb-1 text-sm text-white/60">/ 100</span>
        </div>
        <p className="mt-2 text-sm font-bold text-pink-accent">{scoreLabel(overall)}</p>
      </div>

      {/* Skill breakdown */}
      {Object.keys(skills).length > 0 && (
        <div className="rounded-card border border-border bg-white p-5 shadow-card">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-ink-secondary">
            Skill breakdown
          </h3>
          <div className="mt-3 space-y-2.5">
            {Object.entries(skills).map(([k, v]) => (
              <div key={k}>
                <div className="flex justify-between text-xs font-bold">
                  <span className="capitalize text-ink-secondary">{k}</span>
                  <span>{v}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-border/60">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${v}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coach message */}
      {coachMessage && (
        <div className="rounded-card border border-primary/30 bg-primary-soft/50 p-5">
          <p className="text-sm leading-6 text-ink-primary">
            <span className="font-extrabold">Coach: </span>
            {coachMessage}
          </p>
        </div>
      )}

      {/* Strengths & weaknesses */}
      {strengths.length > 0 && (
        <div className="rounded-card border border-border bg-white p-5 shadow-card">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-success">
            What you did well
          </h3>
          <ul className="mt-2 space-y-1.5 text-sm text-ink-secondary">
            {strengths.map((s) => (
              <li key={s}>✓ {s}</li>
            ))}
          </ul>
          {weaknesses.length > 0 && (
            <>
              <h3 className="mt-4 text-xs font-extrabold uppercase tracking-wider text-warning">
                What to improve
              </h3>
              <ul className="mt-2 space-y-1.5 text-sm text-ink-secondary">
                {weaknesses.map((w) => (
                  <li key={w}>• {w}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {/* Next exercise */}
      {nextExercise && (
        <div className="rounded-card border border-border bg-white p-5 shadow-card">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-ink-secondary">
            Practice task
          </h3>
          <p className="mt-2 text-sm leading-6 text-ink-primary">{nextExercise.instruction}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 inline-flex items-center gap-2 rounded-pill bg-primary px-5 py-2.5 text-sm font-extrabold text-white hover:bg-primary-hover"
            >
              Practice Again <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      <Link
        href="/communication/progress"
        className="block rounded-pill border border-border py-3 text-center text-sm font-extrabold text-ink-secondary hover:border-primary hover:text-primary"
      >
        View progress →
      </Link>
    </div>
  );
}

// ── Main page component ───────────────────────────────────────────────────

function LiveTrainingContent() {
  const [skills, setSkills] = useState<CommSkill[]>([]);
  const [modes, setModes] = useState<CommMode[]>([]);
  const [skill, setSkill] = useState("clarity");
  const [mode, setMode] = useState("free");
  const [question, setQuestion] = useState(STARTER_QUESTIONS[0]);
  const [phase, setPhase] = useState<"setup" | "active" | "results">("setup");
  const [duration, setDuration] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [liveResult, setLiveResult] = useState<LiveSessionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [shareVisualCues, setShareVisualCues] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  // Hooks
  const live = useGeminiLive();
  const camera = useCameraStream();
  const faceScanner = useFaceEmotionScanner({
    externalStream: camera.stream,
    enabled: shareVisualCues && camera.active,
    onSummary: live.setFacialSummary,
  });
  const stopLive = live.stop;
  const stopCamera = camera.stop;
  const startLive = live.start;
  const startCamera = camera.start;
  const cameraActive = camera.active;
  const getFullTranscript = live.getFullTranscript;

  // ── Load skill library ──────────────────────────────────────────────

  useEffect(() => {
    communicationApi
      .listSkills()
      .then((d) => {
        setSkills(d.skills);
        setModes(d.modes);
      })
      .catch(() => setError("Could not load the skill library."));
  }, []);

  // ── Timer ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (live.listening) {
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [live.listening]);

  // ── Propagate live errors ───────────────────────────────────────────

  useEffect(() => {
    if (live.error) setError(live.error);
  }, [live.error]);

  // ── Auto-scroll transcript ──────────────────────────────────────────

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [live.messages]);

  // ── Auto cleanup on unmount or tab exit ──────────────────────────────

  useEffect(() => {
    return () => {
      stopLive();
      stopCamera();
    };
  }, [stopLive, stopCamera]);

  // ── Start session ───────────────────────────────────────────────────

  const toggleCamera = useCallback(async () => {
    if (cameraActive) {
      stopCamera();
      return;
    }

    await startCamera();
  }, [cameraActive, stopCamera, startCamera]);

  const startSession = useCallback(async () => {
    setError(null);
    setLiveResult(null);
    setDuration(0);

    if (shareVisualCues) await startCamera();

    setPhase("active");
    await startLive(question, skill, mode);
  }, [question, skill, mode, shareVisualCues, startLive, startCamera]);

  // ── Stop session & analyze ──────────────────────────────────────────

  const stopSession = useCallback(async () => {
    stopLive();
    stopCamera();

    const { userText, aiText } = getFullTranscript();
    if (!userText.trim()) {
      setError("We couldn't capture your speech. Check your microphone and try again.");
      setPhase("setup");
      return;
    }

    setAnalyzing(true);
    setError(null);
    try {
      const res = await communicationApi.saveLiveSession({
        userTranscript: userText,
        aiTranscript: aiText,
        skill,
        mode,
        durationSeconds: duration,
      });
      setLiveResult(res);
      setPhase("results");
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI coaching is temporarily unavailable.");
      setPhase("setup");
    } finally {
      setAnalyzing(false);
    }
  }, [stopLive, stopCamera, getFullTranscript, skill, mode, duration]);

  // ── Retry with feedback ─────────────────────────────────────────────

  const retryWithFeedback = useCallback(async () => {
    const nextQ =
      liveResult && "nextQuestion" in liveResult && liveResult.nextQuestion
        ? liveResult.nextQuestion
        : question;
    setQuestion(nextQ);
    setLiveResult(null);
    setDuration(0);
    setError(null);
    setPhase("active");
    if (shareVisualCues) await startCamera();
    await startLive(nextQ, skill, mode);
  }, [liveResult, question, skill, mode, shareVisualCues, startLive, startCamera]);

  // ── Reset ───────────────────────────────────────────────────────────

  const resetSession = useCallback(() => {
    stopLive();
    stopCamera();
    setPhase("setup");
    setLiveResult(null);
    setDuration(0);
    setError(null);
  }, [stopLive, stopCamera]);

  // ── Derived values ──────────────────────────────────────────────────

  const mmss = `${String(Math.floor(duration / 60)).padStart(2, "0")}:${String(duration % 60).padStart(2, "0")}`;
  const activeSkill = skills.find((s) => s.id === skill);

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden shrink-0 md:block"><Sidebar /></div>
      <div className="flex min-w-0 flex-1 flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-border bg-white px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <Link
            href="/communication"
            className="flex items-center gap-1.5 rounded-pill border border-border px-3 py-1.5 text-xs font-bold text-ink-secondary hover:border-primary hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-primary">
              <Sparkles className="h-4 w-4" /> Live Training
            </div>
            <h1 className="text-lg font-extrabold tracking-tight text-ink-primary sm:text-xl">
              Face-to-Face AI Coach
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {phase === "active" && (
            <span className="rounded-pill bg-ink-primary px-4 py-1.5 text-xs font-extrabold text-white tabular-nums">
              {mmss}
            </span>
          )}
          {phase === "active" && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-xs font-extrabold ${
                live.listening
                  ? "bg-success-soft text-success"
                  : "bg-surface-alt text-ink-secondary"
              }`}
            >
              {live.listening ? (
                <>
                  <Mic className="h-3.5 w-3.5" /> Live
                </>
              ) : (
                <>
                  <MicOff className="h-3.5 w-3.5" /> Connecting
                </>
              )}
            </span>
          )}
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div
          className="mx-5 mt-4 flex items-start gap-3 rounded-card bg-error-soft p-4 text-sm text-error sm:mx-8"
          role="alert"
        >
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* ── SETUP PHASE ────────────────────────────────────────────── */}
      {phase === "setup" && (
        <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-8 sm:px-8">
          <div className="rounded-card border border-border bg-white p-6 shadow-card sm:p-8">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-primary">
              <Radio className="h-4 w-4" /> Live AI Coach — Face to Face
            </div>
            <p className="mt-3 text-sm leading-6 text-ink-secondary">
              Start a <strong className="text-ink-primary">real-time voice conversation</strong> with
              your AI communication coach. Your camera will appear on the left, and the AI coach avatar
              on the right — just like a real face-to-face training session.
            </p>

            {/* Skill selector */}
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-ink-secondary">
                  Training skill
                </label>
                <div className="mt-2 space-y-1.5">
                  {skills.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSkill(s.id)}
                      className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${
                        skill === s.id
                          ? "bg-primary-soft text-primary"
                          : "text-ink-secondary hover:bg-surface-alt"
                      }`}
                    >
                      {s.name}{" "}
                      <span className="ml-1 text-[10px] font-semibold text-ink-muted">{s.category}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-ink-secondary">
                  Session mode
                </label>
                <div className="mt-2 space-y-1.5">
                  {modes.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMode(m.id)}
                      className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${
                        mode === m.id
                          ? "bg-primary-soft text-primary"
                          : "text-ink-secondary hover:bg-surface-alt"
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Question */}
            <div className="mt-6 rounded-xl border border-primary/20 bg-primary-soft/30 p-4">
              <p className="text-xs font-extrabold uppercase tracking-wider text-ink-muted">
                First question
              </p>
              <p className="mt-2 text-lg font-extrabold leading-7 text-ink-primary">
                &quot;{question}&quot;
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {STARTER_QUESTIONS.filter((q) => q !== question).slice(0, 3).map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuestion(q)}
                    className="rounded-pill border border-border px-3 py-1.5 text-xs font-bold text-ink-secondary hover:border-primary hover:text-primary"
                  >
                    {q.slice(0, 30)}…
                  </button>
                ))}
              </div>
            </div>

            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4">
              <input
                type="checkbox"
                checked={shareVisualCues}
                onChange={(event) => setShareVisualCues(event.target.checked)}
                className="mt-1 h-4 w-4 accent-primary"
              />
              <span>
                <span className="block text-sm font-extrabold text-ink-primary">
                  Enable local camera coaching and share measured summaries with Gemini
                </span>
                <span className="mt-1 block text-xs leading-5 text-ink-muted">
                  Video stays on this device. Gemini receives only quality-qualified 5-second summaries of face visibility, head direction, and facial movement, never camera frames. These are approximate presentation cues, not emotion or interview scores.
                </span>
              </span>
            </label>

            {/* Training info */}
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                { icon: <Camera className="h-5 w-5" />, label: "Camera Controls", desc: "Toggle camera on/off anytime like Google Meet" },
                { icon: <Mic className="h-5 w-5" />, label: "Microphone", desc: "AI listens and responds live" },
                { icon: <Volume2 className="h-5 w-5" />, label: "AI Avatar", desc: "Interactive bot on the right" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3 rounded-xl bg-surface-alt p-3">
                  <div className="mt-0.5 text-primary">{item.icon}</div>
                  <div>
                    <p className="text-sm font-extrabold text-ink-primary">{item.label}</p>
                    <p className="text-xs text-ink-muted">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Start button */}
            <button
              type="button"
              onClick={() => void startSession()}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-pill bg-primary px-6 py-3.5 text-sm font-extrabold text-white shadow-[0_3px_0_#4b31d1] hover:bg-primary-hover sm:w-auto"
            >
              <Radio className="h-4 w-4" /> Start Live Training
            </button>
          </div>
        </main>
      )}

      {/* ── ACTIVE PHASE (Google Meet Style Interface) ───────────────────────── */}
      {phase === "active" && (
        <main className="flex flex-1 flex-col">
          {/* Split screen: user camera (left) + AI avatar (right) */}
          <div className="flex flex-1 flex-col lg:flex-row">
            {/* Left: User camera / Voice mode box */}
            <div className="relative flex flex-1 items-center justify-center bg-ink-primary/95 p-6">
              <div className="relative overflow-hidden rounded-2xl shadow-lg w-full max-w-[480px] min-h-[260px] flex items-center justify-center bg-ink-primary/90">
                {camera.active ? (
                  <video
                    ref={camera.videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="h-full w-full object-cover min-h-[260px]"
                    style={{ transform: "scaleX(-1)" }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white shadow-inner mb-3">
                      <CameraOff className="h-8 w-8 text-white/50" />
                    </div>
                    <p className="text-sm font-extrabold text-white">Camera is Off</p>
                    <p className="mt-1 text-xs text-white/60">
                      Session continues uninterrupted in voice mode.
                    </p>
                    {camera.error && (
                      <p role="alert" className="mt-2 max-w-xs text-xs text-red-200">
                        {camera.error}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => void toggleCamera()}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-pill bg-primary px-4 py-1.5 text-xs font-bold text-white shadow-md hover:bg-primary-hover transition"
                    >
                      <Camera className="h-3.5 w-3.5" /> Turn On Camera
                    </button>
                  </div>
                )}

                {camera.active && shareVisualCues && (
                  <p className="absolute left-3 top-3 rounded-full bg-ink-primary/80 px-3 py-1.5 text-xs font-bold text-white">
                    {faceScanner.error
                      ? "Local analysis unavailable"
                      : faceScanner.warmupProgress < 1
                        ? `Local analysis warming up ${Math.round(faceScanner.warmupProgress * 100)}%`
                        : faceScanner.summary?.status === "available"
                          ? "Local signals ready"
                          : "Waiting for clear face frames"}
                  </p>
                )}

                {/* User label overlay */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-pill bg-ink-primary/80 px-3 py-1.5 backdrop-blur-sm">
                  <div className={`h-2 w-2 rounded-full ${live.listening ? "bg-success animate-pulse" : "bg-ink-muted"}`} />
                  <span className="text-xs font-extrabold text-white">You</span>
                </div>

                {/* Google Meet style camera overlay button */}
                <button
                  type="button"
                  onClick={() => void toggleCamera()}
                  title={camera.active ? "Turn camera off" : "Turn camera on"}
                  className={`absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full transition shadow-md ${
                    camera.active ? "bg-ink-primary/70 text-white hover:bg-ink-primary" : "bg-error text-white hover:bg-error/90"
                  }`}
                >
                  {camera.active ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Right: AI Avatar */}
            <div className="relative flex flex-1 items-center justify-center bg-[#fbfbfe] p-6">
              <div className="flex flex-col items-center gap-6">
                <AiAvatar speaking={live.aiSpeaking} audioLevel={live.aiAudioLevel} />

                {/* AI status */}
                <div className="text-center">
                  <p className="text-lg font-extrabold text-ink-primary">AI Coach</p>
                  <div className="mt-1.5 flex items-center justify-center gap-2">
                    {live.aiSpeaking ? (
                      <>
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                        </span>
                        <span className="text-xs font-bold text-primary">Speaking…</span>
                      </>
                    ) : live.listening ? (
                      <>
                        <span className="h-2.5 w-2.5 rounded-full bg-success" />
                        <span className="text-xs font-bold text-success">Listening…</span>
                      </>
                    ) : live.connected ? (
                      <>
                        <Volume2 className="h-3.5 w-3.5 animate-pulse text-ink-muted" />
                        <span className="text-xs font-bold text-ink-muted">Connecting…</span>
                      </>
                    ) : (
                      <span className="text-xs font-bold text-ink-muted">Ready</span>
                    )}
                  </div>
                </div>

                {/* Skill badge */}
                <span className="rounded-pill bg-primary-soft px-3 py-1.5 text-xs font-extrabold text-primary">
                  {activeSkill?.name ?? "Communication"} · {modes.find((m) => m.id === mode)?.name ?? "Free"}
                </span>
              </div>
            </div>
          </div>

          {/* Transcript panel */}
          {showTranscript && (
            <div className="border-t border-border bg-white px-5 sm:px-8">
              <div className="mx-auto max-w-4xl">
                <div className="max-h-48 overflow-y-auto py-4 space-y-3">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-ink-muted">
                    Live transcript
                  </p>
                  {live.messages.length === 0 && (
                    <p className="text-sm text-ink-muted">
                      {live.listening ? "AI coach is starting the conversation…" : "Connecting…"}
                    </p>
                  )}
                  {live.messages.map((msg, i) => (
                    <ChatBubble key={`${msg.role}-${i}`} msg={msg} />
                  ))}
                  <div ref={transcriptEndRef} />
                </div>
              </div>
            </div>
          )}

          {/* Google Meet Style Bottom Control Bar */}
          <div className="border-t border-border bg-white px-5 py-4 sm:px-8">
            <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-3">
              {/* Google Meet Camera Toggle Button */}
              <button
                type="button"
                onClick={() => void toggleCamera()}
                title={camera.active ? "Turn camera off" : "Turn camera on"}
                className={`inline-flex items-center gap-2 rounded-pill px-4 py-2.5 text-sm font-extrabold transition border ${
                  camera.active
                    ? "border-border bg-white text-ink-primary hover:bg-surface-alt"
                    : "border-error/30 bg-error-soft text-error hover:bg-error/10"
                }`}
              >
                {camera.active ? (
                  <>
                    <Camera className="h-4 w-4 text-primary" />
                    Camera On
                  </>
                ) : (
                  <>
                    <CameraOff className="h-4 w-4 text-error" />
                    Camera Off
                  </>
                )}
              </button>

              {/* Transcript toggle */}
              <button
                type="button"
                onClick={() => setShowTranscript((v) => !v)}
                className={`inline-flex items-center gap-2 rounded-pill border px-4 py-2.5 text-sm font-bold transition ${
                  showTranscript
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-border text-ink-secondary hover:border-primary hover:text-primary"
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                {showTranscript ? "Hide" : "Show"} Transcript
                {live.messages.length > 0 && (
                  <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-extrabold text-primary">
                    {live.messages.length}
                  </span>
                )}
              </button>

              {/* End session */}
              {live.listening ? (
                <button
                  type="button"
                  onClick={() => void stopSession()}
                  disabled={analyzing}
                  className="inline-flex items-center gap-2 rounded-pill bg-error px-6 py-2.5 text-sm font-extrabold text-white hover:bg-error/90 disabled:opacity-50"
                >
                  <Square className="h-4 w-4" />
                  {analyzing ? "Analyzing…" : "End Training & Score"}
                </button>
              ) : !analyzing && !live.connected ? (
                <button
                  type="button"
                  onClick={() => void startSession()}
                  className="inline-flex items-center gap-2 rounded-pill bg-primary px-6 py-3 text-sm font-extrabold text-white shadow-[0_3px_0_#4b31d1] hover:bg-primary-hover"
                >
                  <Radio className="h-4 w-4" /> Reconnect
                </button>
              ) : analyzing ? (
                <div className="flex items-center gap-2 text-sm font-bold text-ink-secondary">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Analyzing your session…
                </div>
              ) : null}

              {/* Reset */}
              <button
                type="button"
                onClick={resetSession}
                disabled={analyzing}
                className="rounded-pill border border-border px-5 py-2.5 text-sm font-bold text-ink-secondary hover:border-primary hover:text-primary disabled:opacity-50"
              >
                Reset
              </button>
            </div>
          </div>
        </main>
      )}

      {/* ── RESULTS PHASE ──────────────────────────────────────────── */}
      {phase === "results" && liveResult && (
        <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-8 sm:px-8">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-extrabold text-ink-primary">Training Complete</h2>
            <p className="mt-2 text-sm text-ink-secondary">
              Here&apos;s your detailed communication analysis from this session.
            </p>
          </div>

          <ScorePanel result={liveResult} onRetry={retryWithFeedback} />

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={resetSession}
              className="rounded-pill border border-border px-6 py-2.5 text-sm font-bold text-ink-secondary hover:border-primary hover:text-primary"
            >
              Start New Training Session
            </button>
          </div>
        </main>
      )}
      </div>
    </div>
  );
}

export default function LiveTrainingPage() {
  return (
    <RequireOnboarding>
      <LiveTrainingContent />
    </RequireOnboarding>
  );
}
