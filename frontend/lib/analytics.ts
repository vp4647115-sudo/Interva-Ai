const CONSENT_KEY = "intervai-cookie-consent";
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

export function track(
  eventName: string,
  properties: Record<string, string | number | boolean> = {},
) {
  if (typeof window === "undefined" || window.localStorage.getItem(CONSENT_KEY) !== "analytics") return;
  window.gtag?.("event", eventName, properties);
  window.dispatchEvent(new CustomEvent("intervai:analytics-event", { detail: { eventName, properties } }));
}

export function updateAnalyticsConsent(allowed: boolean) {
  if (GA_ID) {
    window[`ga-disable-${GA_ID}`] = !allowed;
    window.gtag?.("consent", "update", {
      analytics_storage: allowed ? "granted" : "denied",
    });
  }
}
