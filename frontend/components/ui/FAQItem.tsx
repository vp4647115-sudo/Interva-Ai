"use client";

import { useState } from "react";
import clsx from "clsx";

export function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl bg-surface shadow-card">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-[68px] w-full items-center justify-between gap-4 px-6 py-4 text-left"
      >
        <span className="font-semibold">{question}</span>
        <svg
          className={clsx("h-5 w-5 shrink-0 text-ink-secondary transition-transform", open && "rotate-90")}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {open && <p className="px-6 pb-6 text-sm leading-relaxed text-ink-secondary">{answer}</p>}
    </div>
  );
}
