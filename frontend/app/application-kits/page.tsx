"use client";

import Link from "next/link";
import { FileText, Mail, Sparkles } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";

const kits = [
  {
    href: "/resume",
    icon: FileText,
    title: "Resume",
    description: "Build, analyze, and export an ATS-friendly resume with Gemini.",
    cta: "Open Resume Builder",
  },
  {
    href: "/cover-letters",
    icon: Mail,
    title: "Cover Letter",
    description: "Generate a tailored cover letter for any job in seconds.",
    cta: "Write a Cover Letter",
  },
];

export default function ApplicationKitsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden shrink-0 md:block"><Sidebar /></div>
      <main className="min-w-0 flex-1 bg-[#fbfbfe]">
        <header className="border-b border-border bg-white px-5 py-6 sm:px-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-primary">Application Kits</h1>
          <p className="mt-2 text-sm text-ink-secondary">Everything you need for a strong application, in one place.</p>
        </header>
        <div className="mx-auto max-w-4xl px-5 py-7 sm:px-8">
          <div className="grid gap-4 sm:grid-cols-2">
            {kits.map((kit) => (
              <article key={kit.href} className="group rounded-card border border-border bg-white p-6 shadow-card transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-modal">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary"><kit.icon className="h-6 w-6" /></span>
                <h2 className="mt-5 text-lg font-extrabold">{kit.title}</h2>
                <p className="mt-2 text-sm leading-6 text-ink-secondary">{kit.description}</p>
                <Link href={kit.href} className="mt-5 inline-flex items-center gap-2 rounded-pill bg-primary px-4 py-2 text-xs font-extrabold text-white transition group-hover:bg-primary-hover"><Sparkles className="h-3.5 w-3.5" /> {kit.cta}</Link>
              </article>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
