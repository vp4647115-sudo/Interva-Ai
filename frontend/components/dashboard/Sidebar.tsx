"use client";

import { useState } from "react";
import Link from "next/link";

type NavItem = { label: string; icon: JSX.Element; active?: boolean };
type NavGroup = { title: string; items: NavItem[] };

const icon = (path: JSX.Element) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-[18px] w-[18px] shrink-0"
  >
    {path}
  </svg>
);

const groups: NavGroup[] = [
  {
    title: "Auto Apply",
    items: [
      {
        label: "Dashboard",
        active: true,
        icon: icon(
          <>
            <rect x="3" y="4" width="18" height="16" rx="3" />
            <path d="M3 9h18M8 4v5" />
          </>
        ),
      },
      {
        label: "Job Search",
        icon: icon(
          <>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </>
        ),
      },
      {
        label: "Saved Jobs",
        icon: icon(<path d="M6 3h12v18l-6-4-6 4V3z" />),
      },
      {
        label: "Answer Library",
        icon: icon(
          <>
            <path d="M4 5a2 2 0 0 1 2-2h6v18H6a2 2 0 0 1-2-2V5z" />
            <path d="M20 5a2 2 0 0 0-2-2h-6v18h6a2 2 0 0 0 2-2V5z" />
          </>
        ),
      },
      {
        label: "Preferences",
        icon: icon(
          <>
            <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
            <circle cx="16" cy="7" r="2" />
            <circle cx="8" cy="17" r="2" />
          </>
        ),
      },
    ],
  },
  {
    title: "Documents",
    items: [
      {
        label: "Application Kits",
        icon: icon(
          <>
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </>
        ),
      },
      {
        label: "Resumes",
        icon: icon(
          <>
            <path d="M6 2h9l5 5v15H6V2z" />
            <path d="M14 2v6h6M9 13h6M9 17h6" />
          </>
        ),
      },
      {
        label: "Cover Letters",
        icon: icon(
          <>
            <path d="M12 19l7-7-4-4-7 7-1 5 5-1z" />
            <path d="M15 8l1.5-1.5a2.1 2.1 0 0 1 3 3L18 11" />
          </>
        ),
      },
    ],
  },
  {
    title: "Interview",
    items: [
      {
        label: "Interview Buddy",
        icon: icon(
          <>
            <circle cx="12" cy="12" r="9" />
            <path d="M9 10h.01M15 10h.01M8.5 14.5a5 5 0 0 0 7 0" />
          </>
        ),
      },
      {
        label: "Mock Interviews",
        icon: icon(
          <>
            <rect x="3" y="5" width="18" height="14" rx="3" />
            <path d="m10 9 5 3-5 3V9z" />
          </>
        ),
      },
      {
        label: "Build Communication",
        icon: icon(
          <>
            <path d="M12 3a7 7 0 0 1 7 7v3l2 3h-4a7 7 0 0 1-10 0H3l2-3v-3a7 7 0 0 1 7-7z" />
            <path d="M9 10h.01M15 10h.01M9.5 13.5a3.5 3.5 0 0 0 5 0" />
          </>
        ),
      },
    ],
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex h-screen flex-col border-r border-border bg-surface transition-all duration-300 ${
        collapsed ? "w-[76px]" : "w-[280px]"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5">
        {!collapsed && (
          <a href="#" className="text-2xl font-extrabold tracking-tight text-primary">
            Interv<span className="text-pink-accent">Ai</span>
          </a>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label="Toggle sidebar"
          className="rounded-lg p-1.5 text-ink-secondary hover:bg-surface-alt hover:text-ink-primary"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="h-5 w-5"
          >
            <rect x="3" y="4" width="18" height="16" rx="3" />
            <path d="M9 4v16M14.5 10 12.5 12l2 2" />
          </svg>
        </button>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3">
        {groups.map((group) => (
          <div key={group.title} className="mb-5">
            {!collapsed && (
              <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-widest text-ink-muted">
                {group.title}
              </p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const routes: Record<string, string> = {
                  Dashboard: "/dashboard",
                  "Job Search": "/jobs",
                  "Saved Jobs": "/saved-jobs",
                  "Answer Library": "/answer-library",
                  Preferences: "/preferences",
                  "Application Kits": "/application-kits",
                  Resumes: "/resume",
                  "Cover Letters": "/cover-letters",
                  "Interview Buddy": "/interview-buddy",
                  "Mock Interviews": "/mock-interviews",
                  "Build Communication": "/communication",
                };
                const href = routes[item.label];
                return (
                  <li key={item.label}>
                    <Link
                      href={href ?? "#"}
                      title={item.label}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                        item.active
                          ? "bg-primary-soft text-primary"
                          : "text-ink-secondary hover:bg-surface-alt hover:text-ink-primary"
                      }`}
                    >
                      {item.icon}
                      {!collapsed && item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-border p-3">
        <button
          className={`flex w-full items-center gap-3 rounded-xl px-2 py-2 hover:bg-surface-alt ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              className="h-4 w-4"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20a8 8 0 0 1 16 0" />
            </svg>
          </span>
          {!collapsed && (
            <>
              <span className="flex-1 truncate text-left text-sm font-bold text-ink-primary">
                Vaibhav Patil
              </span>
              <span className="rounded-pill bg-surface-alt px-2.5 py-0.5 text-[11px] font-bold text-ink-secondary">
                Free
              </span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                className="h-4 w-4 text-ink-muted"
              >
                <path d="m7 9 5-5 5 5M7 15l5 5 5-5" />
              </svg>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
