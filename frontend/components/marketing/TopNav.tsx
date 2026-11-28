"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PillLink } from "@/components/ui/PillButton";

const BREADCRUMB_LABELS: Record<string, string> = {
  about: "About",
  blog: "Blog",
  careers: "Careers",
  contact: "Contact",
  cookies: "Cookies",
  documentation: "Documentation",
  faq: "FAQ",
  "help-center": "Help Center",
  "interview-guides": "Interview Guides",
  "press-kit": "Press Kit",
  privacy: "Privacy",
  "question-bank": "Question Bank",
  terms: "Terms",
};

export function TopNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const breadcrumbSegments = (pathname || "/").split("/").filter(Boolean);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-surface/90 backdrop-blur">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6"
      >
        <a href="/" className="shrink-0 text-lg font-extrabold tracking-tight">
          Interv<span className="text-primary">Ai</span>
        </a>
        <div className="hidden items-center gap-6 text-sm font-medium text-ink-secondary md:flex">
          <a href="/#features" className="hover:text-ink-primary">Features</a>
          <a href="/#faq" className="hover:text-ink-primary">FAQ</a>
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <PillLink href="/auth/login" variant="secondary" size="sm">Log in</PillLink>
          <PillLink href="/auth/register" size="sm">Sign up</PillLink>
        </div>
        <button
          aria-controls="mobile-main-navigation"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border text-ink-primary transition-colors hover:bg-surface-alt focus-visible:outline-offset-2 md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            {menuOpen ? <path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" /> : <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </nav>
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out md:hidden ${
          menuOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        } ${menuOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        id="mobile-main-navigation"
        aria-hidden={!menuOpen}
      >
        <div className="overflow-hidden">
          <div className="space-y-1 border-t border-border/60 bg-surface px-4 py-3">
            <a
              className="block rounded-xl px-4 py-3 text-sm font-semibold text-ink-secondary hover:bg-surface-alt"
              href="/#features"
              onClick={() => setMenuOpen(false)}
              tabIndex={menuOpen ? undefined : -1}
            >
              Features
            </a>
            <a
              className="block rounded-xl px-4 py-3 text-sm font-semibold text-ink-secondary hover:bg-surface-alt"
              href="/#faq"
              onClick={() => setMenuOpen(false)}
              tabIndex={menuOpen ? undefined : -1}
            >
              FAQ
            </a>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <PillLink href="/auth/login" variant="secondary" size="sm" className="justify-center" onClick={() => setMenuOpen(false)} tabIndex={menuOpen ? undefined : -1}>Log in</PillLink>
              <PillLink href="/auth/register" size="sm" className="justify-center" onClick={() => setMenuOpen(false)} tabIndex={menuOpen ? undefined : -1}>Sign up</PillLink>
            </div>
          </div>
        </div>
      </div>
      {breadcrumbSegments.length > 0 && (
        <div className="border-t border-border/40">
          <nav aria-label="Breadcrumb" className="mx-auto max-w-6xl px-4 py-2 text-xs text-ink-muted sm:px-6">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link href="/" className="hover:text-primary">Home</Link></li>
              {breadcrumbSegments.map((segment, index) => {
                const label = BREADCRUMB_LABELS[segment] ?? segment.replace(/-/g, " ");
                const href = `/${breadcrumbSegments.slice(0, index + 1).join("/")}`;
                const current = index === breadcrumbSegments.length - 1;
                return (
                  <li key={href} className="flex items-center gap-2">
                    <span aria-hidden="true">/</span>
                    {current
                      ? <span aria-current="page" className="font-semibold capitalize text-ink-secondary">{label}</span>
                      : <Link href={href} className="capitalize hover:text-primary">{label}</Link>}
                  </li>
                );
              })}
            </ol>
          </nav>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Home", item: "https://intervai.vpnpro.in/" },
                  ...breadcrumbSegments.map((segment, index) => ({
                    "@type": "ListItem",
                    position: index + 2,
                    name: BREADCRUMB_LABELS[segment] ?? segment.replace(/-/g, " "),
                    item: `https://intervai.vpnpro.in/${breadcrumbSegments.slice(0, index + 1).join("/")}`,
                  })),
                ],
              }).replace(/</g, "\\u003c"),
            }}
          />
        </div>
      )}
    </header>
  );
}
