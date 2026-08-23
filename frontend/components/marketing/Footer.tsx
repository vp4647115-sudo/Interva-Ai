"use client";

import { useState } from "react";

/* Design tokens from design.md §3–5 (rule.md §3 — no ad hoc hex colors). */

type NavLink = { label: string; href: string };
type NavColumn = { title: string; links: NavLink[] };

const NAV_COLUMNS: NavColumn[] = [
  {
    title: "Product",
    links: [
      { label: "AI Mock Interviews", href: "#features" },
      { label: "Resume Analysis", href: "#features" },
      { label: "Performance Scoring", href: "#faq" },
      { label: "Pricing", href: "#" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "For Job Seekers", href: "#" },
      { label: "For Students", href: "#" },
      { label: "For Career Switchers", href: "#" },
      { label: "For Teams", href: "#" },
      { label: "For Bootcamps", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "#" },
      { label: "Interview Guides", href: "#" },
      { label: "Question Bank", href: "#" },
      { label: "Help Center", href: "#" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Documentation", href: "#" },
      { label: "API Reference", href: "#" },
      { label: "SDKs & Libraries", href: "#" },
      { label: "Status", href: "#" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Discord", href: "#" },
      { label: "Forum", href: "#" },
      { label: "Events & Webinars", href: "#" },
      { label: "Success Stories", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press Kit", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
    ],
  },
];

const SOCIAL_LINKS = [
  {
    label: "X (Twitter)",
    href: "#",
    iconPath:
      "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  {
    label: "LinkedIn",
    href: "#",
    iconPath:
      "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.554V9h3.565v11.452z",
  },
  {
    label: "GitHub",
    href: "#",
    iconPath:
      "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
  },
  {
    label: "YouTube",
    href: "#",
    iconPath:
      "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
];

function SocialIcon({ label, href, iconPath }: (typeof SOCIAL_LINKS)[number]) {
  return (
    <a
      href={href}
      aria-label={label}
      title={label}
      className="flex h-10 w-10 items-center justify-center rounded-pill border border-border bg-surface text-ink-secondary transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:bg-primary-soft hover:text-primary"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]" aria-hidden="true">
        <path d={iconPath} />
      </svg>
    </a>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      return;
    }
    setStatus("success");
    setEmail("");
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-5">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setStatus("idle");
          }}
          placeholder="Enter your email"
          className="w-full rounded-input border border-border bg-surface px-4 py-2.5 text-sm text-ink-primary placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          className="shrink-0 rounded-input bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          Subscribe
        </button>
      </div>
      <p
        role="status"
        aria-live="polite"
        className={`mt-2 min-h-[1.25rem] text-xs ${
          status === "success" ? "text-success" : status === "error" ? "text-error" : "text-ink-muted"
        }`}
      >
        {status === "success"
          ? "You're subscribed! Welcome aboard 🎉"
          : status === "error"
            ? "Please enter a valid email address."
            : "Interview tips and product updates. No spam."}
      </p>
    </form>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-alt">
      {/* Top: brand + nav columns */}
      <div className="mx-auto max-w-7xl px-6 py-14 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(280px,340px)_1fr] lg:gap-16">
          {/* Brand section */}
          <div>
            <a href="/" className="inline-flex items-center gap-1 text-xl font-extrabold tracking-tight text-ink-primary">
              Interview<span className="text-primary">AI</span>
            </a>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-secondary">
              Practice real interviews with an AI that adapts to you. Get structured feedback, track your progress,
              and walk into every interview confident.
            </p>

            {/* Social icons */}
            <div className="mt-6 flex items-center gap-3" aria-label="Social media">
              {SOCIAL_LINKS.map((s) => (
                <SocialIcon key={s.label} {...s} />
              ))}
            </div>

            {/* Newsletter */}
            <div className="mt-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-ink-primary">Stay in the loop</h3>
              <NewsletterForm />
            </div>
          </div>

          {/* Navigation columns */}
          <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 xl:grid-cols-6 xl:gap-x-6">
            {NAV_COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="text-sm font-bold text-ink-primary">{col.title}</h3>
                <ul className="mt-4 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-ink-secondary transition-colors duration-150 hover:text-primary"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-sm text-ink-muted sm:flex-row">
          <p>© {new Date().getFullYear()} InterviewAI. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="transition-colors hover:text-ink-primary">Privacy</a>
            <a href="#" className="transition-colors hover:text-ink-primary">Terms</a>
            <a href="#" className="transition-colors hover:text-ink-primary">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
