// Typed API client. Auth is handled by Firebase on the client; requests to the
// FastAPI backend carry a Firebase ID token in the Authorization header.
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

import { getIdToken } from "@/lib/firebase/auth";

export interface UserOut {
  id: string;
  email: string;
  full_name: string | null;
  email_verified: boolean;
}

export interface ProfileOut {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  location: string | null;
  birth_date: string | null;
  target_role: string | null;
  bio: string | null;
  subscription_plan: string;
  subscription_status: string;
  interviews_conducted: number;
  resources_count: number;
  upcoming_interviews_count: number;
  mock_interviews_count: number;
  onboarding_completed: boolean;
}

export interface ProfileIn {
  full_name?: string | null;
  phone?: string | null;
  location?: string | null;
  birth_date?: string | null;
  target_role?: string | null;
  bio?: string | null;
}

export interface EducationEntry {
  id: string;
  school: string;
  degree: string | null;
  field_of_study: string | null;
  start_date: string | null;
  end_date: string | null;
}

export interface ExperienceEntry {
  id: string;
  company: string;
  title: string;
  description: string | null;
  years: number | null;
  start_date: string | null;
  end_date: string | null;
}

export interface SkillEntry {
  id: string;
  name: string;
  level: number;
}

export interface CertificateEntry {
  id: string;
  name: string;
  cert_id: string | null;
  link: string | null;
  storage_key?: string | null;
}

export interface Preferences {
  target_roles: string[];
  seniority: string | null;
  preferred_industries: string[];
}

export interface WizardState {
  completed_steps: string[];
  current_step: number;
  finished: boolean;
}

export interface DashboardStats {
  completion_percent: number;
  education_count: number;
  experience_count: number;
  skill_count: number;
}

export interface ResumeEntry {
  id: string;
  filename: string;
  storage_key: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  status: "uploaded" | "parsing" | "parsed" | "failed";
}

export interface InterviewSession {
  id: string;
  role: string;
  interview_type: string;
  difficulty: "easy" | "medium" | "hard";
  duration_minutes: number;
  status: "draft" | "in_progress" | "completed" | "abandoned";
  score: number | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string | null;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getIdToken();
  const resp = await fetch(`${API_BASE}/api${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}));
    throw new Error(body.detail ?? "Something went wrong. Please try again.");
  }
  return resp.json() as Promise<T>;
}

export const apiClient = {
  me: () => request<UserOut>("/auth/me"),
  sync: () => request<UserOut>("/auth/sync", { method: "POST" }),

  // Profile
  getProfile: () => request<ProfileOut>("/auth/profile"),
  updateProfile: (payload: ProfileIn) =>
    request<ProfileOut>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  // Onboarding wizard state
  getWizardState: () => request<WizardState>("/onboarding/state"),
  saveWizardState: (state: WizardState) =>
    request<WizardState>("/onboarding/state", {
      method: "PUT",
      body: JSON.stringify(state),
    }),
  finishOnboarding: () =>
    request<WizardState>("/onboarding/finish", { method: "POST" }),

  /**
   * Post-login destination: first-time users go to the onboarding wizard;
   * returning users (wizard finished) go straight to the dashboard.
   * Falls back to the dashboard when the check fails so a backend hiccup
   * never traps a signed-in user on the login page.
   */
  postLoginDestination: async (): Promise<"/onboarding" | "/dashboard"> => {
    try {
      await apiClient.sync();
      const wizard = await apiClient.getWizardState();
      return wizard.finished ? "/dashboard" : "/onboarding";
    } catch {
      return "/dashboard";
    }
  },

  // Education
  listEducation: () => request<EducationEntry[]>("/onboarding/education"),
  addEducation: (entry: Omit<EducationEntry, "id">) =>
    request<EducationEntry>("/onboarding/education", {
      method: "POST",
      body: JSON.stringify(entry),
    }),
  deleteEducation: (id: string) =>
    request<void>(`/onboarding/education/${id}`, { method: "DELETE" }),

  // Experience
  listExperience: () => request<ExperienceEntry[]>("/onboarding/experience"),
  addExperience: (entry: Omit<ExperienceEntry, "id">) =>
    request<ExperienceEntry>("/onboarding/experience", {
      method: "POST",
      body: JSON.stringify(entry),
    }),
  deleteExperience: (id: string) =>
    request<void>(`/onboarding/experience/${id}`, { method: "DELETE" }),

  // Skills
  listSkills: () => request<SkillEntry[]>("/onboarding/skills"),
  addSkill: (entry: Omit<SkillEntry, "id">) =>
    request<SkillEntry>("/onboarding/skills", {
      method: "POST",
      body: JSON.stringify(entry),
    }),
  deleteSkill: (id: string) =>
    request<void>(`/onboarding/skills/${id}`, { method: "DELETE" }),

  // Certificates
  listCertificates: () => request<CertificateEntry[]>("/onboarding/certificates"),
  addCertificate: (entry: { name: string; cert_id?: string | null; link?: string | null }) =>
    request<CertificateEntry>("/onboarding/certificates", {
      method: "POST",
      body: JSON.stringify(entry),
    }),
  deleteCertificate: (id: string) => request<void>(`/onboarding/certificates/${id}`, { method: "DELETE" }),

  // Preferences
  getPreferences: () => request<Preferences>("/onboarding/preferences"),
  savePreferences: (prefs: Preferences) =>
    request<Preferences>("/onboarding/preferences", {
      method: "PUT",
      body: JSON.stringify(prefs),
    }),

  // Dashboard
  getDashboard: () => request<DashboardStats>("/onboarding/dashboard"),

  // Resumes (Phase 3 CRUD)
  listResumes: () => request<ResumeEntry[]>("/resumes"),
  addResume: (entry: Omit<ResumeEntry, "id" | "status">) =>
    request<ResumeEntry>("/resumes", {
      method: "POST",
      body: JSON.stringify(entry),
    }),
  updateResume: (
    id: string,
    patch: { extracted_text?: string; status?: ResumeEntry["status"] }
  ) =>
    request<ResumeEntry>(`/resumes/${id}`, {
      method: "PUT",
      body: JSON.stringify(patch),
    }),
  deleteResume: (id: string) => request<void>(`/resumes/${id}`, { method: "DELETE" }),

  // Interview session records (Phase 3 data layer)
  listSessions: () => request<InterviewSession[]>("/interviews"),
  createSession: (input: Omit<InterviewSession, "id" | "status" | "score" | "started_at" | "finished_at" | "created_at">) =>
    request<InterviewSession>("/interviews", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  getSession: (id: string) => request<InterviewSession>(`/interviews/${id}`),
  updateSessionStatus: (
    id: string,
    patch: { status: InterviewSession["status"]; score?: number }
  ) =>
    request<InterviewSession>(`/interviews/${id}`, {
      method: "PUT",
      body: JSON.stringify(patch),
    }),
  deleteSession: (id: string) => request<void>(`/interviews/${id}`, { method: "DELETE" }),
};
