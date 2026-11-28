"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Consent = "analytics" | "essential";
const CONSENT_KEY = "intervai-cookie-consent";
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(name: string, parameters: Record<string, string | number | boolean> = {}) {
  if (window.localStorage.getItem(CONSENT_KEY) !== "analytics") return;
  window.gtag?.("event", name, parameters);
  window.dispatchEvent(new CustomEvent("intervai:analytics-event", { detail: { name, parameters } }));
}

function enableAnalytics() {
  if (!GA_ID || document.getElementById("intervai-ga")) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = (...args: unknown[]) => window.dataLayer?.push(args);
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { anonymize_ip: true });

  const script = document.createElement("script");
  script.id = "intervai-ga";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(script);
}

export function CookieConsent() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<Consent | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(CONSENT_KEY);
    if (saved === "analytics" || saved === "essential") setConsent(saved);
    setLoaded(true);
    if (saved === "analytics") enableAnalytics();

    const openPreferences = () => setConsent(null);
    window.addEventListener("intervai:manage-cookie-consent", openPreferences);
    return () => window.removeEventListener("intervai:manage-cookie-consent", openPreferences);
  }, []);

  useEffect(() => {
    if (consent === "analytics") {
      enableAnalytics();
      trackEvent("page_view", { page_path: pathname });
    }
  }, [consent, pathname]);

  const saveConsent = useCallback((value: Consent) => {
    window.localStorage.setItem(CONSENT_KEY, value);
    setConsent(value);
  }, []);

  if (!loaded || consent !== null) return null;

  return (
    <section
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      className="fixed inset-x-4 bottom-4 z-[90] mx-auto max-w-3xl rounded-2xl border border-border bg-surface p-5 shadow-modal sm:inset-x-6 sm:p-6"
    >
      <h2 id="cookie-consent-title" className="text-base font-bold text-ink-primary">Your privacy choices</h2>
      <p className="mt-2 text-sm leading-6 text-ink-secondary">
        Essential storage keeps the site working. Optional analytics help us understand visits and are only enabled if you agree.
        Read our <a href="/cookies" className="font-semibold text-primary underline">cookie policy</a>.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={() => saveConsent("analytics")} className="rounded-input bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover">
          Accept analytics
        </button>
        <button type="button" onClick={() => saveConsent("essential")} className="rounded-input border border-border px-4 py-2.5 text-sm font-semibold text-ink-primary hover:bg-surface-alt">
          Reject optional cookies
        </button>
      </div>
    </section>
  );
}

export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("intervai:manage-cookie-consent"))}
      className="rounded-input border border-border px-4 py-2 text-sm font-semibold text-primary hover:bg-surface"
    >
      Manage cookie preferences
    </button>
  );
}
