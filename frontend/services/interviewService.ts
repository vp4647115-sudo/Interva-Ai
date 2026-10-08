/** Typed client for multi-turn Interview Engine backend endpoints. */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function engineRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { getIdToken } = await import("@/lib/firebase/auth");
  const token = await getIdToken();
  const resp = await fetch(`${API_BASE}/api/interview-engine${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data.detail ?? "Interview Engine request failed.");
  return data as T;
}

export interface StartInterviewResponse {
  sessionId: string;
  status: string;
  currentTurn: number;
  question: string;
  topic?: string;
  difficulty?: string;
  lookFors: string[];
}

export interface TurnEvaluation {
  score: number;
  verdict: string;
  rubric: {
    technical: number;
    communication: number;
    problem_solving: number;
    relevance: number;
    confidence: number;
    fluency: number;
    grammar: number;
  };
  strengths: string[];
  improvements: string[];
  missedConcepts: string[];
  followUpQuestion: string;
}

export interface SubmitAnswerResponse {
  evaluation: TurnEvaluation;
  isFinished: boolean;
  nextQuestion?: {
    turnNumber: number;
    question: string;
    topic?: string;
    difficulty?: string;
    lookFors: string[];
  };
}

export interface InterviewReportData {
  sessionId: string;
  role: string;
  overallScore: number;
  rubricScores: {
    technical: number;
    communication: number;
    problemSolving: number;
    relevance: number;
    confidence: number;
    fluency: number;
    grammar: number;
  };
  facialPresentation?: {
    facialScore: number | null;
    grade: string;
    status: "available" | "unavailable";
    summary: string;
    strengths: string[];
    improvements: string[];
    coaching: string[];
    faceVisibility?: number;
    eyeContact?: number;
    engagement?: number;
    sampleCount?: number;
  };
  facialScore?: number | null;
  facialGrade?: string;
  summary: string;
  strengths: string[];
  improvements: string[];
  missedConcepts: string[];
  recommendations: string[];
}

export async function startInterviewSession(payload: {
  role: string;
  interviewType: "technical" | "behavioral" | "mixed";
  difficulty: "easy" | "medium" | "hard";
  durationMinutes?: number;
}): Promise<StartInterviewResponse> {
  return engineRequest<StartInterviewResponse>("/start", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function submitTurnAnswer(
  sessionId: string,
  payload: { turnNumber: number; answer: string }
): Promise<SubmitAnswerResponse> {
  return engineRequest<SubmitAnswerResponse>(`/${sessionId}/answer`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function finishInterviewSession(
  sessionId: string,
  payload?: { faceAnalysis?: unknown }
): Promise<{ success: boolean; report: InterviewReportData }> {
  return engineRequest<{ success: boolean; report: InterviewReportData }>(`/${sessionId}/finish`, {
    method: "POST",
    body: JSON.stringify(payload ?? {}),
  });
}

export async function getInterviewReport(sessionId: string): Promise<InterviewReportData> {
  return engineRequest<InterviewReportData>(`/${sessionId}/report`);
}

export interface CodeRunResponse {
  success: boolean;
  stdout: string;
  stderr: string;
  executionTimeMs: number;
  testResults: Array<{ passed: boolean; actual?: unknown; expected?: unknown; error?: string }>;
  error: string | null;
}

export async function runCandidateCode(payload: {
  code: string;
  language: string;
  testCases?: Array<Record<string, unknown>>;
}): Promise<CodeRunResponse> {
  return engineRequest<CodeRunResponse>("/code-run", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

