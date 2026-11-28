/**
 * Dual-environment URL helper.
 * Supports both:
 * 1. Localhost (http://localhost:3000)
 * 2. Custom domain (https://intervai.vpnpro.in)
 */

export function getApiBase(): string {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    // When accessed through intervai.vpnpro.in or another non-localhost host
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      const customApi = process.env.NEXT_PUBLIC_API_URL;
      // If NEXT_PUBLIC_API_URL points to localhost or is empty, use relative ""
      // so requests flow through Next.js /api rewrite proxy without mixed-content issues.
      if (!customApi || customApi.includes("localhost") || customApi.includes("127.0.0.1")) {
        return "";
      }
      return customApi.replace(/\/$/, "");
    }
  }
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");
}

export function getAppUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
