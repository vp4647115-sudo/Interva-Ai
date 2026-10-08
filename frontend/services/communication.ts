export interface CommSkill {
  id: string;
  name: string;
  category: string;
  hasTraining: boolean;
}

export interface CommMode {
  id: string;
  name: string;
  instruction: string;
}

export interface CommAnalysis {
  success: boolean;
  sessionId: string;
  overallScore: number;
  questionAnswered: boolean | null;
  questionAssessment: string;
  skills: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  evidence: { category: string; observation: string; recommendation: string }[];
  nextExercise: { skill: string; instruction: string };
  coachMessage: string;
  correction: string;
  explanation: string;
  betterVersion: string;
  retryPrompt: string;
  nextQuestion: string;
  mode: string;
  skill: string;
  metrics: {
    wordCount: number;
    speechRate: number | null;
    fillerCount: number;
    fillerWords: string[];
    sentenceCount: number;
    avgSentenceWords: number | null;
  };
}

export interface LiveSessionResult {
  success: boolean;
  sessionId: string;
  analyzed: boolean;
  metrics?: CommAnalysis["metrics"];
  overallScore?: number;
  skills?: Record<string, number>;
  strengths?: string[];
  weaknesses?: string[];
  evidence?: CommAnalysis["evidence"];
  nextExercise?: CommAnalysis["nextExercise"];
  coachMessage?: string;
  correction?: string;
  explanation?: string;
  betterVersion?: string;
  retryPrompt?: string;
  nextQuestion?: string;
}

export interface CommProgress {
  sessions: {
    id: string;
    mode: string;
    skill: string;
    durationSeconds: number;
    overallScore: number | null;
    createdAt: string | null;
  }[];
  progress: {
    overallScore: number | null;
    skillAverages: Record<string, number>;
    sessionCount: number;
    totalSpeakingMinutes: number;
    strongestSkill: string | null;
    weakestSkill: string | null;
    improvement: number;
  };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const { getIdToken } = await import("@/lib/firebase/auth");
  const token = await getIdToken();
  const resp = await fetch(`${API_BASE}/api/communication${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  const body = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    if (resp.status === 503 && typeof body.detail === "string" && body.detail.toLowerCase().includes("quota")) {
      throw new Error("AI coaching is temporarily unavailable because the Gemini quota is exhausted. Please try again later or update the backend Gemini plan/key.");
    }
    throw new Error(body.detail ?? "Something went wrong. Please try again.");
  }
  return body as T;
}

export const communicationApi = {
  listSkills: () => request<{ skills: CommSkill[]; modes: CommMode[] }>("/skills"),
  analyze: (input: { transcript: string; skill: string; mode: string; durationSeconds: number; question?: string; targetRole?: string }) =>
    request<CommAnalysis>("/analyze", { method: "POST", body: JSON.stringify(input) }),
  saveLiveSession: (input: {
    userTranscript: string;
    aiTranscript: string;
    skill: string;
    mode: string;
    durationSeconds: number;
  }) => request<LiveSessionResult>("/live-session", { method: "POST", body: JSON.stringify(input) }),
  history: () => request<CommProgress>("/history"),
  deleteHistory: () => request<{ success: boolean }>("/history", { method: "DELETE" }),
};

export function scoreLabel(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good Progress";
  if (score >= 50) return "Developing";
  return "Keep Practicing";
}

