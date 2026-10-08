/** Typed client for the AI tool endpoints (cover letter, buddy, mock interviews). */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function aiPost<T>(path: string, body: unknown): Promise<T> {
  const { getIdToken } = await import("@/lib/firebase/auth");
  const token = await getIdToken();
  const resp = await fetch(`${API_BASE}/api/ai${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data.detail ?? "AI request failed. Please try again.");
  return data as T;
}

export interface CoverLetterResult {
  subject: string;
  body: string;
  highlights: string[];
}

export const generateCoverLetter = (payload: {
  jobTitle: string;
  company: string;
  jobDescription?: string;
  candidateName?: string;
  skills?: string[];
  experience?: string;
  tone?: "professional" | "enthusiastic" | "concise";
}) => aiPost<CoverLetterResult & { success: boolean }>("/cover-letter", payload);

export interface BuddyResult {
  answer: string;
  tips: string[];
}

export const askBuddy = (payload: {
  question: string;
  targetRole?: string;
  history?: { role: string; content: string }[];
}) => aiPost<BuddyResult & { success: boolean }>("/interview-buddy", payload);

export interface MockQuestionResult {
  question: string;
  topic: string;
  whatWeLookFor: string[];
}

export const getMockQuestion = (payload: {
  role: string;
  difficulty: "easy" | "medium" | "hard";
  interviewType: "technical" | "behavioral" | "mixed";
}) => aiPost<MockQuestionResult & { success: boolean }>("/mock/question", payload);

export interface MockEvaluationResult {
  score: number;
  verdict: string;
  strengths: string[];
  improvements: string[];
  missedConcepts: string[];
  followUpQuestion: string;
}

export const evaluateMockAnswer = (payload: {
  role: string;
  question: string;
  answer: string;
  difficulty: "easy" | "medium" | "hard";
}) => aiPost<MockEvaluationResult & { success: boolean }>("/mock/evaluate", payload);

export interface WhiteboardAuditResult {
  problemStatement: { restatement: string; ambiguities: string[]; scopeDefined: boolean };
  techStackChoices: { tool: string; reasonable: boolean; alternative: string; tradeoff: string; justified: boolean }[];
  securityReview: { missing: string[]; covered: string[] };
  dsaAnalysis: { coreDataStructures: string[]; algorithms: string[]; timeComplexity: string; spaceComplexity: string; optimalAlternative: string };
  fullGapChecklist: { checklist: { item: string; covered: boolean }[]; topFixPriorities: { rank: number; gap: string; action: string }[] };
}

export const auditWhiteboardSession = (payload: {
  problemStatement: string;
  candidateSolution: string;
}) => aiPost<WhiteboardAuditResult & { success: boolean }>("/whiteboard/audit", payload);
