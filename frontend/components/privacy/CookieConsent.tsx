"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { track, updateAnalyticsConsent } from "@/lib/analytics";

type Consent = "analytics" | "essential";
const CONSENT_KEY = "intervai-cookie-consent";
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

function enableAnalytics() {
  if (!GA_ID || document.getElementById("intervai-ga")) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = (...args: unknown[]) => window.dataLayer?.push(args);
  window.gtag("consent", "default", { analytics_storage: "granted" });
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { anonymize_ip: true, send_page_view: false });

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
  const [bannerOpen, setBannerOpen] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(CONSENT_KEY);
    if (saved === "analytics" || saved === "essential") {
      setConsent(saved);
      setAnalyticsAllowed(saved === "analytics");
      setBannerOpen(false);
    } else {
      setBannerOpen(true);
    }
    setLoaded(true);
    if (saved === "analytics") enableAnalytics();

    const openPreferences = () => {
      setAnalyticsAllowed(window.localStorage.getItem(CONSENT_KEY) === "analytics");
      setCustomizing(true);
      setBannerOpen(true);
    };
    window.addEventListener("intervai:manage-cookie-consent", openPreferences);
    return () => window.removeEventListener("intervai:manage-cookie-consent", openPreferences);
  }, []);

  useEffect(() => {
    if (consent === "analytics") {
      enableAnalytics();
      track("page_view", { page_path: pathname });
    }
  }, [consent, pathname]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const element = event.target.closest("a, button");
      if (!element || element.hasAttribute("disabled")) return;

      const label = (element.textContent || element.getAttribute("aria-label") || "").trim().slice(0, 100);
      if (element instanceof HTMLAnchorElement) {
        const href = element.getAttribute("href") || "";
        if (href.startsWith("http://") || href.startsWith("https://")) {
          const destination = new URL(href);
          if (destination.origin !== window.location.origin) {
            track("outbound_link_click", { destination: `${destination.origin}${destination.pathname}`, label });
          }
        }
        if (
          href === "/auth/register" ||
          element.hasAttribute("data-track-cta") ||
          /\b(start|practice|sign up|try|create account)\b/i.test(label)
        ) {
          track("cta_click", { label, destination: href });
        }
      } else if (element.hasAttribute("data-track-cta")) {
        track("cta_click", { label });
      }
    };
    const handleSubmit = (event: Event) => {
      if (!(event.target instanceof HTMLFormElement)) return;
      const formName =
        event.target.getAttribute("aria-label") ||
        event.target.id ||
        event.target.getAttribute("name") ||
        window.location.pathname;
      track("form_submit", { form_name: formName });
    };

    document.addEventListener("click", handleClick);
    document.addEventListener("submit", handleSubmit, true);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("submit", handleSubmit, true);
    };
  }, []);

  const saveConsent = useCallback((value: Consent) => {
    window.localStorage.setItem(CONSENT_KEY, value);
    setConsent(value);
    setAnalyticsAllowed(value === "analytics");
    setBannerOpen(false);
    setCustomizing(false);
    updateAnalyticsConsent(value === "analytics");
    if (value === "analytics") enableAnalytics();
  }, []);

  if (!loaded || !bannerOpen) return null;

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
        Read our <a href="/privacy" className="font-semibold text-primary underline">Privacy Policy</a>.
      </p>
      {customizing && (
        <fieldset className="mt-4 rounded-xl border border-border p-4">
          <legend className="px-1 text-sm font-semibold text-ink-primary">Optional cookies</legend>
          <label className="flex items-start gap-3 text-sm text-ink-secondary">
            <input
              type="checkbox"
              checked={analyticsAllowed}
              onChange={(event) => setAnalyticsAllowed(event.target.checked)}
              className="mt-1 accent-primary"
            />
            <span><strong className="text-ink-primary">Analytics</strong> — allow anonymous usage measurement.</span>
          </label>
        </fieldset>
      )}
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={() => saveConsent("analytics")} className="rounded-input bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover">
          Accept all
        </button>
        <button type="button" onClick={() => saveConsent("essential")} className="rounded-input border border-border px-4 py-2.5 text-sm font-semibold text-ink-primary hover:bg-surface-alt">
          Reject optional
        </button>
        {customizing ? (
          <button type="button" onClick={() => saveConsent(analyticsAllowed ? "analytics" : "essential")} className="rounded-input border border-primary px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary-soft">
            Save preferences
          </button>
        ) : (
          <button type="button" onClick={() => setCustomizing(true)} className="rounded-input border border-border px-4 py-2.5 text-sm font-semibold text-ink-primary hover:bg-surface-alt">
            Customize
          </button>
        )}
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
