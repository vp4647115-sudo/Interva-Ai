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
};
