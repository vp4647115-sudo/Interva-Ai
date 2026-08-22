// Typed API client for the auth domain. All server data flows through here +
// TanStack Query — no raw fetch in components (rule.md §1).

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface UserOut {
  id: string;
  email: string;
  full_name: string | null;
  email_verified: boolean;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: UserOut;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("interviai_access_token") : null;
  const resp = await fetch(`${API_BASE}/api/auth${path}`, {
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

function persistSession(auth: AuthResponse) {
  // MVP: tokens in localStorage; move to httpOnly cookie session via backend
  // before production (rule.md §6 security baseline).
  localStorage.setItem("interviai_access_token", auth.access_token);
  localStorage.setItem("interviai_refresh_token", auth.refresh_token);
}

export const authService = {
  async register(input: { email: string; password: string; fullName?: string; consentTerms: boolean; consentAnalytics: boolean }) {
    return request<{ message: string }>("/register", {
      method: "POST",
      body: JSON.stringify({
        email: input.email,
        password: input.password,
        full_name: input.fullName,
        consent_terms: input.consentTerms,
        consent_analytics: input.consentAnalytics,
      }),
    });
  },

  async login(email: string, password: string) {
    const auth = await request<AuthResponse>("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    persistSession(auth);
    return auth.user;
  },

  async forgotPassword(email: string) {
    return request<{ message: string }>("/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(newPassword: string) {
    return request<{ message: string }>("/reset-password", {
      method: "POST",
      body: JSON.stringify({ new_password: newPassword }),
    });
  },

  googleStartUrl() {
    return `${API_BASE}/api/auth/oauth/google/start`;
  },

  logout() {
    localStorage.removeItem("interviai_access_token");
    localStorage.removeItem("interviai_refresh_token");
  },
};
