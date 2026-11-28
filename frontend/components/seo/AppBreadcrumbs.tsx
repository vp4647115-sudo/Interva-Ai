"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_URL } from "@/lib/site";

const MARKETING_ROUTES = new Set([
  "/",
  "/about",
  "/blog",
  "/careers",
  "/contact",
  "/cookies",
  "/documentation",
  "/faq",
  "/help-center",
  "/interview-guides",
  "/press-kit",
  "/privacy",
  "/question-bank",
  "/terms",
]);

const LABELS: Record<string, string> = {
  "answer-library": "Saved Answers",
  "application-kits": "Application Kits",
  auth: "Account",
  callback: "Sign In",
  login: "Log In",
  register: "Create Account",
  "reset-password": "Reset Password",
  verify: "Verify Account",
  communication: "Communication Practice",
  "live-training": "Live Training",
  progress: "Progress",
  "cover-letters": "Cover Letters",
  dashboard: "Dashboard",
  "interview-buddy": "Interview Buddy",
  jobs: "Job Search",
  "mock-interviews": "Mock Interviews",
  onboarding: "Profile Setup",
  preferences: "Preferences",
  profile: "Profile",
  resume: "Resume",
  print: "Resume Preview",
  "saved-jobs": "Saved Jobs",
};

export function AppBreadcrumbs() {
  const pathname = usePathname() || "/";
  if (MARKETING_ROUTES.has(pathname)) return null;

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  const items = segments
    .map((segment, index) => ({
      label: LABELS[segment] ?? segment.replace(/-/g, " "),
      href: `/${segments.slice(0, index + 1).join("/")}`,
    }))
    .filter((item) => item.href !== "/auth");

  return (
    <div className="border-b border-border/60 bg-surface">
      <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-5 py-2 text-xs text-ink-muted sm:px-8">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href="/" className="hover:text-primary">Home</Link></li>
          {items.map((item, index) => (
            <li key={item.href} className="flex items-center gap-2">
              <span aria-hidden="true">/</span>
              {index === items.length - 1
                ? <span aria-current="page" className="font-semibold capitalize text-ink-secondary">{item.label}</span>
                : <Link href={item.href} className="capitalize hover:text-primary">{item.label}</Link>}
            </li>
          ))}
        </ol>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
              ...items.map((item, index) => ({
                "@type": "ListItem",
                position: index + 2,
                name: item.label,
                item: `${SITE_URL}${item.href}`,
              })),
            ],
          }).replace(/</g, "\\u003c"),
        }}
      />
    </div>
  );
}
