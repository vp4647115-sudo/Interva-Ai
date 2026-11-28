const API_ORIGIN = new URL(
  process.env.NEXT_PUBLIC_API_URL ?? "https://nextapi.vpnpro.in"
).origin;

export const API_BASE =
  process.env.NODE_ENV === "production" ? "/backend-api" : API_ORIGIN;

export function getApiBase(): string {
  return API_BASE;
}

export function getAppUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
