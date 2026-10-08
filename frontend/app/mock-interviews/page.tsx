"use client";

import { useEffect, useState } from "react";
import {
  Award,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  HelpCircle,
  History,
  Loader2,
  RotateCcw,
  Search,
  Sparkles,
  TriangleAlert,
  Volume2,
  VolumeX,
} from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import CodeEditorComponent from "@/components/interview/CodeEditorComponent";
import TestCasePanel from "@/components/interview/TestCasePanel";
import VoiceRecorderControls from "@/components/interview/VoiceRecorderControls";
import { useAudioPlayer } from "@/lib/speech/useAudioPlayer";
import { useFaceEmotionScanner } from "@/lib/speech/useFaceEmotionScanner";
import { useVoiceAnswer } from "@/lib/speech/useVoiceAnswer";
import {
  CodeRunResponse,
  finishInterviewSession,
  InterviewReportData,
  runCandidateCode,
  startInterviewSession,
  submitTurnAnswer,
  TurnEvaluation,
} from "@/services/interviewService";



type Phase = "setup" | "active" | "turn_feedback" | "report";

interface PastTurnRecord {
  turnNumber: number;
  question: string;
  answer: string;
  score: number;
  verdict: string;
}

export default function MockInterviewsPage() {
  const [phase, setPhase] = useState<Phase>("setup");

  // Setup form state
  const [role, setRole] = useState("Backend Engineer");
  const [difficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [interviewType] = useState<"technical" | "behavioral" | "mixed">("technical");
  const [durationMinutes] = useState(30);
  const [inputMode] = useState<"text" | "voice" | "coding">("voice");
  const [autoReadQuestion] = useState(true);

  // Coding workspace state
  const [code, setCode] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("python");
  const [codeExecutionOutput, setCodeExecutionOutput] = useState<CodeRunResponse | null>(null);
  const [isExecutingCode, setIsExecutingCode] = useState(false);

  // Voice & Audio Hooks
  const audioPlayer = useAudioPlayer();
  const voiceAnswer = useVoiceAnswer({
    onTranscriptChange: (text) => setAnswer(text),
  });
  const faceScanner = useFaceEmotionScanner();

  const normalizeReport = (rawReport: Partial<InterviewReportData>): InterviewReportData => {
    const report = rawReport as Partial<InterviewReportData> & Record<string, unknown>;
    const rubricScores = {
      technical: Number(report.technical_score ?? report.rubricScores?.technical ?? 0),
      communication: Number(report.communication_score ?? report.rubricScores?.communication ?? 0),
      problemSolving: Number(report.problem_solving_score ?? report.rubricScores?.problemSolving ?? 0),
      relevance: Number(report.relevance_score ?? report.rubricScores?.relevance ?? 0),
      confidence: Number(report.confidence_score ?? report.rubricScores?.confidence ?? 0),
      fluency: Number(report.fluency_score ?? report.rubricScores?.fluency ?? 0),
      grammar: Number(report.grammar_score ?? report.rubricScores?.grammar ?? 0),
    };

    return {
      sessionId: String(report.sessionId ?? ""),
      role: String(report.role ?? ""),
      overallScore: Number(report.overallScore ?? report.overall_score ?? 0),
      rubricScores,
      facialPresentation: report.facialPresentation,
      facialScore: report.facialScore ?? ((report.facial_score as number | null | undefined) ?? null),
      facialGrade: report.facialGrade ?? ((report.facial_grade as string | undefined)),
      summary: String(report.summary ?? ""),
      strengths: Array.isArray(report.strengths) ? report.strengths : [],
      improvements: Array.isArray(report.improvements) ? report.improvements : [],
      missedConcepts: Array.isArray(report.missedConcepts) ? report.missedConcepts : [],
      recommendations: Array.isArray(report.recommendations) ? report.recommendations : [],
    };
  };

  const handleRunCode = async () => {
    const codeToRun = code.trim() || answer.trim();
    if (!codeToRun) return;
    setIsExecutingCode(true);
    try {
      const res = await runCandidateCode({
        code: codeToRun,
        language: codeLanguage,
        testCases: [
          { functionName: "solution", inputs: [[2, 7, 11, 15], 9], expectedOutput: [0, 1] },
        ],
      });
      setCodeExecutionOutput(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Code execution failed.");
    } finally {
      setIsExecutingCode(false);
    }
  };


  // Active session state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentTurn, setCurrentTurn] = useState(1);
  const [question, setQuestion] = useState("");
  const [topic, setTopic] = useState("");
  const [lookFors, setLookFors] = useState<string[]>([]);
  const [answer, setAnswer] = useState("");


  // Turn evaluation state
  const [activeTurnEval, setActiveTurnEval] = useState<TurnEvaluation | null>(null);
  const [pastTurns, setPastTurns] = useState<PastTurnRecord[]>([]);

  // Final Report state
  const [report, setReport] = useState<InterviewReportData | null>(null);

  // Status & timing
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Timer effect for active session
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (phase === "active" || phase === "turn_feedback") {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [phase]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleStartInterview = async () => {
    if (!role.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const res = await startInterviewSession({
        role: role.trim(),
        interviewType,
        difficulty,
        durationMinutes,
      });
      setSessionId(res.sessionId);
      setCurrentTurn(res.currentTurn);
      setQuestion(res.question);
      setTopic(res.topic || "Core Technical");
      setLookFors(res.lookFors || []);
      setAnswer("");
      voiceAnswer.resetTranscript();
      setActiveTurnEval(null);
      setPastTurns([]);
      setReport(null);
      setElapsedSeconds(0);
      faceScanner.reset();
      faceScanner.start().catch(() => undefined);
      setPhase("active");

      if (autoReadQuestion) {
        audioPlayer.speak(res.question);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start interview session.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTurnAnswer = async () => {
    const finalAnswer = inputMode === "coding" ? (code.trim() || answer.trim()) : answer.trim();
    if (!sessionId || !finalAnswer) return;
    voiceAnswer.stopListening();
    audioPlayer.stop();
    setError(null);
    setLoading(true);
    try {
      const res = await submitTurnAnswer(sessionId, {
        turnNumber: currentTurn,
        answer: finalAnswer,
      });

      setActiveTurnEval(res.evaluation);

      // Save past turn record
      const record: PastTurnRecord = {
        turnNumber: currentTurn,
        question,
        answer: finalAnswer,
        score: res.evaluation.score,
        verdict: res.evaluation.verdict,
      };
      setPastTurns((prev) => [...prev, record]);

      if (res.isFinished || !res.nextQuestion) {
        const repRes = await finishInterviewSession(sessionId, {
          faceAnalysis: faceScanner.summary ?? undefined,
        });
        setReport(normalizeReport(repRes.report));
        faceScanner.stop();
        setPhase("report");
      } else {
        // Store next question data ready for next turn transition
        const nextQ = res.nextQuestion;
        setPhase("turn_feedback");
        // Update state after user acknowledges feedback
        setTimeout(() => {
          setCurrentTurn(nextQ.turnNumber);
          setQuestion(nextQ.question);
          setTopic(nextQ.topic || "Technical");
          setLookFors(nextQ.lookFors || []);
          setAnswer("");
          setCodeExecutionOutput(null);
          voiceAnswer.resetTranscript();
        }, 10);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Evaluation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNextTurnClick = () => {
    setActiveTurnEval(null);
    setPhase("active");
    if (autoReadQuestion && question) {
      audioPlayer.speak(question);
    }
  };

  const handleFinishEarly = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const repRes = await finishInterviewSession(sessionId, {
        faceAnalysis: faceScanner.summary ?? undefined,
      });
      setReport(normalizeReport(repRes.report));
      faceScanner.stop();
      setPhase("report");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate interview report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden shrink-0 md:block">
        <Sidebar />
      </div>
      <main className="min-w-0 flex-1 bg-[#fbfbfe]">
        {/* Header */}
        <header className="border-b border-border bg-white px-5 py-6 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-ink-primary flex items-center gap-2.5">
                <Sparkles className="h-7 w-7 text-primary" /> AI Mock Interview
              </h1>
              <p className="mt-1 text-sm text-ink-secondary">
                Multi-turn adaptive technical & behavioral evaluation engine.
              </p>
            </div>
            {(phase === "active" || phase === "turn_feedback") && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-pill bg-surface-alt px-4 py-2 text-xs font-bold text-ink-primary border border-border">
                  <Clock className="h-4 w-4 text-primary" /> Timer: {formatTimer(elapsedSeconds)}
                </div>
                <button
                  onClick={() => void handleFinishEarly()}
                  disabled={loading}
                  className="rounded-pill border border-error/30 bg-error-soft px-4 py-2 text-xs font-extrabold text-error hover:bg-error/10"
                >
                  End & Generate Report
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="mx-auto max-w-4xl px-5 py-7 sm:px-8">
          {error && (
            <p role="alert" className="mb-6 flex items-start gap-2 rounded-card bg-error-soft p-4 text-sm font-semibold text-error">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" /> {error}
            </p>
          )}

          {/* SETUP PHASE */}
          {phase === "setup" && (
            <section className="overflow-hidden rounded-[28px] border border-[#e7ebf6] bg-white shadow-[0_18px_45px_rgba(17,17,17,0.04)]">
              <div className="bg-gradient-to-r from-[#edf4ff] via-[#f3f6ff] to-[#e7f0ff] px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-2xl">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#171b2c] px-4 py-2 text-sm font-extrabold text-white shadow-sm ring-1 ring-white/15">
                      <Sparkles className="h-4 w-4 text-primary" />
                      AI-Powered
                    </span>

                    <h2 className="mt-6 text-4xl font-black tracking-[-0.06em] text-ink-primary sm:text-5xl xl:text-[5rem]">
                      <span className="block text-[#2f5ae7]">Role-Based</span>
                      <span className="block text-[#2d4ee0]">Mock Interview</span>
                    </h2>

                    <p className="mt-5 max-w-xl text-base font-medium text-[#5e6e8f] sm:text-lg">
                      Master your concepts with full-length AI-powered mock interviews for 360° preparation!
                    </p>
                  </div>

                  <div className="flex items-center justify-center lg:justify-end">
                    <div className="relative flex h-[180px] w-[360px] items-center justify-center">
                      <div className="absolute left-8 top-6 h-24 w-24 rounded-[28px] bg-gradient-to-br from-[#111827] via-[#1f2937] to-[#3b82f6] shadow-[0_25px_35px_rgba(37,99,235,0.2)]" />
                      <div className="absolute left-12 top-12 h-18 w-18 rounded-[20px] bg-white/95 p-2 shadow-lg">
                        <div className="flex h-full items-center justify-center rounded-[14px] bg-[#f4f7ff] text-3xl font-black text-[#1d4ed8]">
                          a
                        </div>
                      </div>

                      <div className="absolute left-[118px] top-8 h-18 w-18 rounded-[20px] bg-white/95 p-2 shadow-lg">
                        <div className="flex h-full items-center justify-center rounded-[14px] bg-[#f6f8ff] text-3xl font-black text-[#111827]">
                          N
                        </div>
                      </div>

                      <div className="absolute left-[190px] top-8 h-18 w-18 rounded-[20px] bg-white/95 p-2 shadow-lg">
                        <div className="flex h-full items-center justify-center rounded-[14px] bg-[#f6f8ff] text-3xl font-black text-[#e11d48]">
                          G
                        </div>
                      </div>

                      <div className="relative h-[120px] w-[310px] rounded-[28px] border border-[#dfe8ff] bg-white/80 p-4 shadow-[0_30px_35px_rgba(148,163,184,0.25)] backdrop-blur-sm">
                        <div className="absolute left-4 right-4 top-4 h-2 rounded-full bg-[#e5e7eb]" />
                        <div className="absolute inset-x-3 bottom-3 top-9 rounded-[22px] bg-[#f5f8ff]" />
                        <div className="absolute left-[38%] top-7 h-3 w-3 rounded-full bg-primary/80" />
                        <div className="absolute right-10 top-5 h-7 w-7 rounded-full border border-[#dfe8ff] bg-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#edf1f8] bg-white px-5 py-5 sm:px-8">
                <div className="flex items-center justify-end">
                  <button type="button" className="inline-flex items-center gap-2 text-sm font-semibold text-[#2f5ae7] transition-colors hover:text-primary">
                    Company based interview <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-6 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                  <div className="xl:max-w-[55%]">
                    <h3 className="text-3xl font-black tracking-[-0.05em] text-ink-primary sm:text-4xl">
                      Click on <span className="text-[#2f5ae7]">Start</span> to begin
                    </h3>
                    <p className="mt-3 text-base text-[#667085]">
                      Find a role that fits your goals and start practicing
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3 rounded-full border border-[#dfe7fb] bg-[#f3f5ff] px-3 py-2 shadow-sm">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#111827] text-xs font-black text-white">
                        un
                      </div>
                      <div className="text-sm font-bold text-[#1f2937]">AI Credits Available</div>
                      <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[#dfe7fb] bg-white text-xs font-bold text-[#2f5ae7]">
                        i
                      </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-full border border-[#dfe7fb] bg-white px-3 py-2 shadow-sm">
                      <span className="text-sm font-medium text-[#4b5563]">3</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <label className="flex w-full items-center gap-3 rounded-full border border-[#dfe7fb] bg-[#f9fafe] px-4 py-4 shadow-inner lg:max-w-[54%]">
                    <Search className="h-5 w-5 text-[#667085]" />
                    <input
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="Search for roles..."
                      className="w-full bg-transparent text-base text-ink-primary outline-none placeholder:text-[#9aa7bd]"
                    />
                  </label>

                  <div className="flex flex-wrap items-center gap-3">
                    <button type="button" className="inline-flex items-center gap-2 rounded-full border border-[#dfe7fb] bg-white px-4 py-2.5 text-sm font-semibold text-[#374151] shadow-sm">
                      Category Tech <ChevronDown className="h-4 w-4" />
                    </button>
                    <button type="button" className="inline-flex items-center gap-2 rounded-full border border-[#dfe7fb] bg-white px-4 py-2.5 text-sm font-semibold text-[#374151] shadow-sm">
                      Role All <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-8 grid gap-5 xl:grid-cols-2">
                  {[
                    {
                      title: "AI Engineer",
                      description: "Builds and deploys machine learning models and AI-powered systems.",
                      companies: ["Microsoft", "Perplexity AI", "Optum"],
                      tag: "Artificial Intelligence (AI), +14",
                    },
                    {
                      title: "Android App Developer",
                      description: "Builds Android applications and mobile experiences.",
                      companies: ["Uber", "Swiggy", "Meesho"],
                      tag: "Debugging, Git Version Control, Firebase, Swift, +11",
                    },
                  ].map((option) => (
                    <div key={option.title} className="rounded-[26px] border border-[#e6ebf5] bg-[#f6f8ff] p-5 shadow-[0_12px_28px_rgba(148,163,184,0.12)]">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="text-[2rem] font-black tracking-[-0.05em] text-ink-primary">{option.title}</h4>
                          <p className="mt-3 max-w-xl text-base text-[#5f6d88]">{option.description}</p>
                        </div>
                      </div>

                      <div className="mt-6 rounded-[18px] border border-[#e7ebf7] bg-white p-4">
                        <div className="flex flex-wrap gap-3">
                          {option.companies.map((company) => (
                            <span
                              key={company}
                              className="inline-flex items-center gap-2 rounded-full border border-[#e6ebf5] bg-[#f8fafc] px-3 py-2 text-sm font-bold text-[#374151]"
                            >
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#111827] text-[10px] font-black text-white">
                                {company.charAt(0)}
                              </span>
                              {company}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between gap-3">
                        <span className="text-base font-medium text-[#374151]">{option.tag}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setRole(option.title);
                            void handleStartInterview();
                          }}
                          disabled={loading}
                          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-extrabold text-white shadow-[0_4px_0_#4c3dde] transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                        >
                          Start <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ACTIVE TURN PHASE */}
          {phase === "active" && (
            <section className="space-y-6">
              {/* Turn indicator */}
              <div className="flex items-center justify-between rounded-card border border-border bg-white px-5 py-3 shadow-card">
                <span className="text-xs font-extrabold text-ink-secondary uppercase tracking-wider">
                  Turn #{currentTurn} of 5
                </span>
                <div className="flex gap-2">
                  <span className="rounded-pill bg-primary-soft px-3 py-1 text-xs font-extrabold text-primary">
                    {topic}
                  </span>
                  <span className="rounded-pill bg-surface-alt px-3 py-1 text-xs font-extrabold text-ink-secondary capitalize">
                    {difficulty}
                  </span>
                </div>
              </div>

              {/* Face tracking preview */}
              <div className="rounded-card border border-border bg-white p-4 shadow-card">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-ink-secondary">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary" />
                    Local camera signals
                  </div>
                  <span className="rounded-pill bg-surface-alt px-2.5 py-1 text-[10px] font-bold text-ink-secondary">
                    {faceScanner.active ? "Live" : faceScanner.summary ? "Ready" : "Waiting"}
                  </span>
                </div>
                <div className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
                  <div className="overflow-hidden rounded-card border border-border bg-black/90">
                    <video
                      ref={faceScanner.videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="h-56 w-full object-cover bg-slate-950"
                    />
                  </div>
                  <div className="space-y-3 rounded-card border border-border bg-surface-alt p-4 text-xs text-ink-secondary">
                    <div>
                      <div className="font-bold text-ink-primary">Face visible</div>
                      <div className="mt-1 text-lg font-extrabold text-ink-primary">
                        {faceScanner.summary ? `${Math.round(faceScanner.summary.facePresenceRatio * 100)}%` : "--"}
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-ink-primary">Head facing camera proxy</div>
                      <div className="mt-1 text-lg font-extrabold text-ink-primary">
                        {faceScanner.summary?.headFacingCameraRatio == null
                          ? "Unknown"
                          : `${Math.round(faceScanner.summary.headFacingCameraRatio * 100)}%`}
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-ink-primary">Expression movement</div>
                      <div className="mt-1 text-lg font-extrabold text-ink-primary">
                        {faceScanner.summary?.expressionMovementMean == null
                          ? "Unknown"
                          : `${Math.round(faceScanner.summary.expressionMovementMean * 100)}%`}
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-ink-primary">Frame quality</div>
                      <div className="mt-1 text-lg font-extrabold text-ink-primary">
                        {faceScanner.summary ? `${Math.round(faceScanner.summary.frameQuality * 100)}%` : "--"}
                      </div>
                    </div>
                    <p>
                      {faceScanner.summary?.status === "insufficient_data"
                        ? "Collecting enough clear frames."
                        : faceScanner.warmupProgress < 1
                          ? `Warming up: ${Math.round(faceScanner.warmupProgress * 100)}%`
                          : "Movement signals are approximate and do not identify emotions."}
                    </p>
                    {faceScanner.error && (
                      <p className="text-error font-semibold">{faceScanner.error}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Question Card */}
              <div className="rounded-card border border-border bg-white p-6 shadow-card sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl font-extrabold leading-8 text-ink-primary">{question}</h2>
                  <button
                    type="button"
                    onClick={() => {
                      if (audioPlayer.isPlaying) {
                        audioPlayer.stop();
                      } else {
                        audioPlayer.speak(question);
                      }
                    }}
                    className={`shrink-0 inline-flex items-center gap-1.5 rounded-pill px-3.5 py-1.5 text-xs font-extrabold transition-all border ${
                      audioPlayer.isPlaying
                        ? "bg-primary text-white border-primary animate-pulse"
                        : "bg-surface-alt text-primary border-primary/30 hover:bg-primary-soft"
                    }`}
                  >
                    {audioPlayer.isPlaying ? (
                      <>
                        <VolumeX className="h-4 w-4" /> Stop Audio
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-4 w-4" /> Listen
                      </>
                    )}
                  </button>
                </div>

                {lookFors.length > 0 && (
                  <details className="mt-4 text-sm text-ink-secondary">
                    <summary className="cursor-pointer font-bold text-primary hover:underline">
                      What a strong answer should cover
                    </summary>
                    <ul className="mt-2.5 space-y-1 rounded-card bg-surface-alt p-3.5 text-xs text-ink-secondary">
                      {lookFors.map((l, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" /> {l}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}

                {/* Response Workspace — Coding Mode vs Voice/Text Mode */}
                {inputMode === "coding" ? (
                  <div className="mt-6 space-y-4">
                    <CodeEditorComponent
                      code={code}
                      language={codeLanguage}
                      onCodeChange={setCode}
                      onLanguageChange={setCodeLanguage}
                      onRunCode={() => void handleRunCode()}
                      isRunning={isExecutingCode}
                    />

                    <TestCasePanel
                      output={codeExecutionOutput}
                      isRunning={isExecutingCode}
                    />
                  </div>
                ) : (
                  <div className="mt-6 space-y-3">
                    <VoiceRecorderControls
                      isListening={voiceAnswer.isListening}
                      volumeLevel={voiceAnswer.volumeLevel}
                      interimTranscript={voiceAnswer.interimTranscript}
                      error={voiceAnswer.error}
                      onStart={() => void voiceAnswer.startListening()}
                      onStop={voiceAnswer.stopListening}
                      onClear={() => {
                        voiceAnswer.resetTranscript();
                        setAnswer("");
                      }}
                    />

                    <div className="mt-2">
                      <label className="block text-xs font-extrabold text-ink-secondary mb-2">
                        Spoken Transcript / Written Response
                      </label>
                      <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Type your structured answer clearly as you would explain it to an interviewer..."
                        className="min-h-48 w-full rounded-input border border-border bg-surface-alt px-4 py-3.5 text-sm leading-6 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                      />
                    </div>
                  </div>
                )}

                <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                  <p className="text-xs text-ink-secondary">
                    {answer.trim().length} characters
                  </p>
                  <button
                    onClick={() => void handleSubmitTurnAnswer()}
                    disabled={!answer.trim() || loading}
                    className="inline-flex items-center gap-2 rounded-pill bg-primary px-7 py-3 text-sm font-extrabold text-white shadow-[0_3px_0_#4b31d1] disabled:opacity-40"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {loading ? "Evaluating Answer…" : "Submit Answer"}
                  </button>
                </div>
              </div>

              {/* Past Turns Accordion */}
              {pastTurns.length > 0 && (
                <div className="rounded-card border border-border bg-white p-5 shadow-card">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-ink-secondary flex items-center gap-2 mb-3">
                    <History className="h-4 w-4 text-primary" /> Session History ({pastTurns.length} turns)
                  </h3>
                  <div className="space-y-2.5">
                    {pastTurns.map((pt) => (
                      <div key={pt.turnNumber} className="rounded-card border border-border bg-surface-alt p-3.5 text-xs">
                        <div className="flex justify-between font-bold text-ink-primary">
                          <span>Turn #{pt.turnNumber}: {pt.question.slice(0, 70)}...</span>
                          <span className="text-primary font-extrabold">{pt.score}/100</span>
                        </div>
                        <p className="mt-1 text-ink-secondary italic">{pt.verdict}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* TURN FEEDBACK PHASE */}
          {phase === "turn_feedback" && activeTurnEval && (
            <section className="space-y-6">
              <div className="rounded-card bg-ink-primary p-7 text-center text-white shadow-card">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/60">
                  Turn #{currentTurn - 1} Evaluation Score
                </p>
                <p className="mt-2 text-6xl font-extrabold">{activeTurnEval.score}<span className="text-2xl text-white/60">/100</span></p>
                <p className="mt-3 text-sm text-white/80 max-w-xl mx-auto">{activeTurnEval.verdict}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-card border border-border bg-white p-5 shadow-card">
                  <h3 className="flex items-center gap-2 font-extrabold text-success">
                    <CheckCircle2 className="h-4 w-4" /> Strengths
                  </h3>
                  <ul className="mt-3 space-y-1.5 text-xs text-ink-secondary">
                    {activeTurnEval.strengths.map((s, i) => (
                      <li key={i}>• {s}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-card border border-border bg-white p-5 shadow-card">
                  <h3 className="flex items-center gap-2 font-extrabold text-warning">
                    <TriangleAlert className="h-4 w-4" /> Key Improvements
                  </h3>
                  <ul className="mt-3 space-y-1.5 text-xs text-ink-secondary">
                    {activeTurnEval.improvements.map((imp, i) => (
                      <li key={i}>• {imp}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {activeTurnEval.missedConcepts.length > 0 && (
                <div className="rounded-card border border-warning/40 bg-warning-soft p-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-warning">
                    Missed Concepts
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {activeTurnEval.missedConcepts.map((c, i) => (
                      <span key={i} className="rounded-pill bg-white px-3 py-1 text-xs font-bold text-ink-secondary shadow-sm">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {activeTurnEval.followUpQuestion && (
                <div className="rounded-card border border-primary/30 bg-white p-5 shadow-card">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <HelpCircle className="h-4 w-4" /> Recommended Follow-up Consideration
                  </h3>
                  <p className="mt-2 text-sm font-bold text-ink-primary">{activeTurnEval.followUpQuestion}</p>
                </div>
              )}

              <button
                onClick={handleNextTurnClick}
                className="w-full inline-flex items-center justify-center gap-2 rounded-pill bg-primary px-8 py-3.5 text-sm font-extrabold text-white shadow-[0_3px_0_#4b31d1]"
              >
                Proceed to Turn #{currentTurn} <ChevronRight className="h-4 w-4" />
              </button>
            </section>
          )}

          {/* FINAL REPORT PHASE */}
          {phase === "report" && report && (
            <section className="space-y-6">
              {/* Grand score hero card */}
              <div className="rounded-card bg-gradient-to-r from-ink-primary via-ink-primary to-primary p-8 text-center text-white shadow-card">
                <div className="inline-flex items-center gap-2 rounded-pill bg-white/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-white">
                  <Award className="h-4 w-4" /> Interview Performance Report
                </div>
                <h2 className="mt-4 text-2xl font-extrabold">{role} Session</h2>
                <div className="mt-4 inline-flex items-baseline gap-1">
                  <span className="text-7xl font-extrabold">{report.overallScore}</span>
                  <span className="text-2xl text-white/60">/ 100</span>
                </div>
                <p className="mt-4 text-xs max-w-2xl mx-auto leading-relaxed text-white/85">
                  {report.summary}
                </p>
              </div>

              {/* Rubric scores grid */}
              <div className="rounded-card border border-border bg-white p-6 shadow-card">
                <h3 className="text-sm font-extrabold text-ink-primary flex items-center gap-2 mb-4">
                  <BarChart3 className="h-4 w-4 text-primary" /> Weighted Rubric Category Breakdown
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
                  <div className="rounded-card bg-surface-alt p-3.5 border border-border">
                    <span className="text-ink-secondary font-bold">Technical Depth (30%)</span>
                    <p className="mt-1 text-xl font-extrabold text-ink-primary">{report.rubricScores.technical}/100</p>
                  </div>
                  <div className="rounded-card bg-surface-alt p-3.5 border border-border">
                    <span className="text-ink-secondary font-bold">Communication (20%)</span>
                    <p className="mt-1 text-xl font-extrabold text-ink-primary">{report.rubricScores.communication}/100</p>
                  </div>
                  <div className="rounded-card bg-surface-alt p-3.5 border border-border">
                    <span className="text-ink-secondary font-bold">Problem Solving (15%)</span>
                    <p className="mt-1 text-xl font-extrabold text-ink-primary">{report.rubricScores.problemSolving}/100</p>
                  </div>
                  <div className="rounded-card bg-surface-alt p-3.5 border border-border">
                    <span className="text-ink-secondary font-bold">Relevance (15%)</span>
                    <p className="mt-1 text-xl font-extrabold text-ink-primary">{report.rubricScores.relevance}/100</p>
                  </div>
                  <div className="rounded-card bg-surface-alt p-3.5 border border-border">
                    <span className="text-ink-secondary font-bold">Confidence (10%)</span>
                    <p className="mt-1 text-xl font-extrabold text-ink-primary">{report.rubricScores.confidence}/100</p>
                  </div>
                  <div className="rounded-card bg-surface-alt p-3.5 border border-border">
                    <span className="text-ink-secondary font-bold">Fluency (5%)</span>
                    <p className="mt-1 text-xl font-extrabold text-ink-primary">{report.rubricScores.fluency}/100</p>
                  </div>
                  <div className="rounded-card bg-surface-alt p-3.5 border border-border">
                    <span className="text-ink-secondary font-bold">Grammar (5%)</span>
                    <p className="mt-1 text-xl font-extrabold text-ink-primary">{report.rubricScores.grammar}/100</p>
                  </div>
                </div>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-card border border-border bg-white p-6 shadow-card">
                  <h3 className="font-extrabold text-success flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4" /> Core Strengths Observed
                  </h3>
                  <ul className="mt-3 space-y-2 text-xs text-ink-secondary">
                    {report.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-success font-bold">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-card border border-border bg-white p-6 shadow-card">
                  <h3 className="font-extrabold text-warning flex items-center gap-2 text-sm">
                    <TriangleAlert className="h-4 w-4" /> Primary Areas for Improvement
                  </h3>
                  <ul className="mt-3 space-y-2 text-xs text-ink-secondary">
                    {report.improvements.map((imp, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-warning font-bold">•</span> {imp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Plan */}
              {report.recommendations.length > 0 && (
                <div className="rounded-card border border-primary/30 bg-white p-6 shadow-card">
                  <h3 className="text-sm font-extrabold text-ink-primary flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-primary" /> Recommended Targeted Practice Plan
                  </h3>
                  <ul className="space-y-2 text-xs text-ink-secondary">
                    {report.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2.5 rounded-card bg-surface-alt p-3 border border-border">
                        <span className="font-extrabold text-primary shrink-0">{i + 1}.</span> {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setPhase("setup");
                    setSessionId(null);
                    setReport(null);
                  }}
                  className="inline-flex items-center gap-2 rounded-pill bg-primary px-8 py-3.5 text-sm font-extrabold text-white shadow-[0_3px_0_#4b31d1]"
                >
                  <RotateCcw className="h-4 w-4" /> Start New Interview Session
                </button>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
