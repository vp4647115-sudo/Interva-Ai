"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ResumeDocument from "@/components/resume/ResumeDocument";
import type { ResumeDraft, ResumeTemplate } from "@/components/resume/types";

const emptyDraft: ResumeDraft = { name: "", role: "", email: "", phone: "", location: "", linkedin: "", summary: "", degree: "", school: "", skills: [], experience: [], projects: [] };

function PrintView() {
  const searchParams = useSearchParams();
  const [draft, setDraft] = useState<ResumeDraft>(emptyDraft);
  const template = (searchParams.get("template") as ResumeTemplate) || "modern";

  useEffect(() => {
    const stored = window.localStorage.getItem("intervai-resume-draft");
    if (stored) {
      try { setDraft(JSON.parse(stored) as ResumeDraft); } catch { /* show blank print-safe document */ }
    }
  }, []);

  return (
    <main className="print-page min-h-screen bg-[#e9ebf2] px-4 py-8 sm:px-8">
      <div className="print-actions mx-auto mb-5 flex max-w-[850px] items-center justify-between gap-3">
        <a href="/resume" className="text-sm font-extrabold text-ink-secondary hover:text-primary">Back to editor</a>
        <button onClick={() => window.print()} className="rounded-pill bg-primary px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_3px_0_#4b31d1]">Print / Save PDF</button>
      </div>
      <div className="mx-auto max-w-[850px]"><ResumeDocument draft={draft} template={template} /></div>
    </main>
  );
}

export default function ResumePrintPage() {
  return (
    <Suspense fallback={<main className="print-page min-h-screen bg-[#e9ebf2]" />}>
      <PrintView />
    </Suspense>
  );
}
