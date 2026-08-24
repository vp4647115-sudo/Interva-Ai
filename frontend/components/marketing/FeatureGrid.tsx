"use client";

import Link from "next/link";
import {
  Bot, FileText, Mail, MessagesSquare, Languages, Sparkles, UserRound,
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "Auto Apply",
    description: "Automate your job search. Our AI applies to perfectly matched positions daily while you focus on preparing for interviews.",
    art: "auto-apply",
  },
  {
    icon: FileText,
    title: "AI Resume Builder",
    description: "Build ATS-optimized resumes tailored to each job description. Our AI highlights your best skills to help you get more interviews.",
    art: "resume",
  },
  {
    icon: Mail,
    title: "AI Cover Letter",
    description: "Generate personalized cover letters in seconds. Each letter matches the job requirements and showcases why you're the perfect fit.",
    art: "cover-letter",
  },
  {
    icon: MessagesSquare,
    title: "AI Interview Practice",
    description: "Simulate real interviews with AI. Get role-specific questions, instant feedback, and build the confidence to ace your next interview.",
    art: "practice",
  },
  {
    icon: Sparkles,
    title: "Interview Buddy",
    description: "Get live AI coaching during interviews. Receive real-time answer suggestions and talking points through your earpiece or screen.",
    art: "buddy",
  },
  {
    icon: Languages,
    title: "Resume Translator",
    description: "Expand your opportunities globally. Professionally translate your resume into 50+ languages while preserving formatting and impact.",
    art: "translator",
  },
];

function FeatureArt({ kind }: { kind: string }) {
  if (kind === "auto-apply") {
    return (
      <div className="relative h-44 overflow-hidden rounded-2xl bg-gradient-to-br from-pink-accent to-orange-400 p-4">
        <div className="absolute left-3 top-6 w-24 rounded-lg border-2 border-dashed border-white/70 bg-white/20 p-2 text-center backdrop-blur-sm">
          <p className="text-[10px] font-extrabold text-white">Upload Resume</p>
          <p className="text-[8px] text-white/80">or drag and drop</p>
        </div>
        <div className="absolute right-3 top-3 w-40 space-y-2">
          {[["Software Engineer, Java Rust", "efTading at Client Server Ltd."], ["Backend Engineer, Payments", "at Acme Corp LLC."]].map(([t, s]) => (
            <div key={t} className="rounded-lg bg-white p-2 shadow-md">
              <p className="truncate text-[9px] font-extrabold text-ink-primary">{t}</p>
              <p className="truncate text-[8px] text-ink-secondary">{s}</p>
              <span className="mt-1 inline-block rounded-pill bg-ink-primary px-2 py-0.5 text-[8px] font-bold text-white">✓ Auto Applied</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (kind === "resume") {
    return (
      <div className="relative h-44 overflow-hidden rounded-2xl bg-gradient-to-br from-orange-300 via-pink-200 to-purple-300 p-4">
        <div className="mx-auto h-full w-40 rounded-lg bg-white/95 p-3 shadow-lg">
          <p className="text-[10px] font-extrabold text-ink-primary">Jane Doe</p>
          <div className="mt-2 space-y-1.5">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-1.5 rounded bg-border" style={{ width: `${90 - i * 12}%` }} />)}
          </div>
          <div className="mt-3 rounded border-2 border-dashed border-primary/50 p-1.5">
            <div className="h-1.5 w-3/4 rounded bg-primary/30" />
          </div>
        </div>
        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-pill bg-ink-primary px-3 py-1.5 text-[9px] font-extrabold text-white shadow-lg">✦ Rewrite Section</span>
      </div>
    );
  }
  if (kind === "cover-letter") {
    return (
      <div className="relative h-44 overflow-hidden rounded-2xl bg-gradient-to-br from-pink-accent to-orange-400 p-4">
        <div className="mx-auto mt-2 h-full w-44 rounded-t-lg bg-white/95 p-3 shadow-lg">
          <div className="flex gap-1">{[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-2.5 w-2.5 rounded-sm bg-border" />)}</div>
          <div className="mt-2 space-y-1.5">
            {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-1.5 rounded bg-border" style={{ width: `${95 - (i % 3) * 15}%` }} />)}
          </div>
        </div>
        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-pill bg-ink-primary px-3 py-1.5 text-[9px] font-extrabold text-white shadow-lg">↓ Download Cover Letter PDF</span>
      </div>
    );
  }
  if (kind === "practice") {
    return (
      <div className="relative h-44 overflow-hidden rounded-2xl bg-gradient-to-br from-pink-accent to-orange-400 p-4">
        <div className="rounded-pill bg-white px-3 py-2 text-[10px] font-bold text-ink-primary shadow">“Can you work with JavaScript?” ✦</div>
        <div className="mx-auto mt-3 w-44 rounded-lg bg-white/95 p-3 shadow-lg">
          <p className="text-center text-[9px] font-extrabold text-ink-primary">Your Personalised Answer…</p>
          <p className="mt-1 text-[8px] leading-4 text-ink-secondary">“Absolutely, working with JavaScript has been a core component of my skillset as a Software Engineer…</p>
        </div>
      </div>
    );
  }
  if (kind === "buddy") {
    return (
      <div className="relative h-44 overflow-hidden rounded-2xl bg-gradient-to-br from-orange-300 via-pink-200 to-purple-300 p-4">
        <div className="mx-auto h-full w-44 rounded-lg bg-white/95 p-3 shadow-lg">
          <div className="mx-auto mt-2 h-12 w-12 rounded-full bg-surface-alt" />
          <div className="mt-3 space-y-1.5">{[1, 2, 3].map((i) => <div key={i} className="h-1.5 rounded bg-border" style={{ width: `${85 - i * 10}%` }} />)}</div>
        </div>
        <div className="absolute bottom-3 right-3 w-28 rounded-lg bg-primary-soft p-2 shadow-lg">
          <p className="text-[7px] font-extrabold uppercase tracking-wide text-primary">Suggested answer…</p>
          <p className="mt-0.5 text-[8px] leading-3 text-ink-secondary">“I can certainly tell you about a challenging project…”</p>
        </div>
      </div>
    );
  }
  return (
    <div className="relative h-44 overflow-hidden rounded-2xl bg-gradient-to-br from-pink-accent to-orange-400 p-4">
      <div className="flex items-center justify-between">
        <span className="rounded-pill bg-white px-3 py-1.5 text-[10px] font-extrabold text-ink-primary shadow">🇪🇸 Spanish ▾</span>
        <span className="rounded-pill bg-ink-primary px-3 py-1.5 text-[10px] font-extrabold text-white shadow">✦ Translate</span>
      </div>
      <div className="mx-auto mt-3 w-40 rounded-lg bg-white/95 p-3 shadow-lg">
        <p className="text-[10px] font-extrabold text-ink-primary">Jane Doe</p>
        <div className="mt-2 space-y-1.5">{[1, 2, 3, 4].map((i) => <div key={i} className="h-1.5 rounded bg-border" style={{ width: `${90 - i * 10}%` }} />)}</div>
      </div>
    </div>
  );
}

export function FeatureGrid() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="text-center text-3xl font-extrabold tracking-tight md:text-4xl">
        Everything you need to get a job FAST!
      </h2>
      <div className="mt-14 grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <article key={f.title}>
            <h3 className="text-xl font-extrabold text-ink-primary">{f.title}</h3>
            <p className="mt-3 text-sm leading-6 text-ink-secondary">{f.description}</p>
            <div className="mt-5"><FeatureArt kind={f.art} /></div>
          </article>
        ))}
      </div>
    </section>
  );
}

const examples = [
  { name: "John Smith", role: "Software Engineer", title: "Software Engineer", blurb: "Perfect for developers, programmers, and tech professionals", updated: "Updated 2 days ago", tint: "bg-purple-100", skills: ["React", "Node.js", "Python", "AWS"], jobs: [["Senior Developer · Tech Corp", "2020 - Present"], ["Full Stack Engineer · StartupXYZ", "2018 - 2020"]] },
  { name: "Sarah Johnson", role: "Marketing Manager", title: "Marketing Manager", blurb: "Ideal for marketing professionals and brand strategists", updated: "Updated 3 days ago", tint: "bg-blue-100", skills: ["SEO", "Analytics", "Content", "Social"], jobs: [["Marketing Lead · BrandCo", "2021 - Present"], ["Digital Marketing · Agency", "2019 - 2021"]] },
  { name: "Michael Chen", role: "Data Analyst", title: "Data Analyst", blurb: "Tailored for data scientists and business analysts", updated: "Updated 1 week ago", tint: "bg-green-100", skills: ["SQL", "Python", "Tableau", "Excel"], jobs: [["Senior Analyst · DataCorp", "2021 - Present"], ["Data Scientist · Analytics Inc", "2019 - 2021"]] },
  { name: "Emma Rodriguez", role: "UX Designer", title: "UX Designer", blurb: "Crafted for designers and user experience professionals", updated: "Updated 5 days ago", tint: "bg-pink-100", skills: ["Figma", "Sketch", "Prototyping", "Research"], jobs: [["Senior UX Designer · DesignHub", "2021 - Present"], ["Product Designer · CreativeStudio", "2019 - 2021"]] },
  { name: "David Wilson", role: "Sales Manager", title: "Sales Manager", blurb: "Designed for sales professionals and business development", updated: "Updated 4 days ago", tint: "bg-orange-100", skills: ["CRM", "SalesForce", "Negotiation", "B2B"], jobs: [["Regional Sales Manager · SalesCorp", "2020 - Present"], ["Account Executive · GrowthCo", "2018 - 2020"]] },
  { name: "Lisa Thompson", role: "Project Manager", title: "Project Manager", blurb: "Perfect for project managers and team leaders", updated: "Updated 1 day ago", tint: "bg-indigo-100", skills: ["Agile", "Scrum", "Jira", "PMP"], jobs: [["Senior PM · Tech Ventures", "2021 - Present"], ["Project Coordinator · BuildCorp", "2019 - 2021"]] },
];

export function ResumeExamples() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-3xl font-extrabold tracking-tight md:text-4xl">Resume Examples</h2>
        <p className="mt-3 text-center text-sm text-ink-secondary">Get inspired by professional resume examples tailored to your industry</p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {examples.map((ex) => (
            <article key={ex.name} className="overflow-hidden rounded-card border border-border bg-surface shadow-card transition hover:-translate-y-1 hover:shadow-modal">
              <div className={`${ex.tint} px-6 pt-6`}>
                <div className="rounded-t-lg bg-white p-4 shadow-sm">
                  <p className="text-center text-xs font-extrabold text-ink-primary">{ex.name}</p>
                  <p className="text-center text-[10px] text-ink-secondary">{ex.role}</p>
                  <p className="mt-3 text-[9px] font-extrabold uppercase tracking-wide text-ink-muted">Experience</p>
                  {ex.jobs.map(([j, d]) => (
                    <div key={j} className="mt-1">
                      <p className="text-[9px] font-bold text-ink-primary">{j}</p>
                      <p className="text-[8px] text-ink-muted">{d}</p>
                    </div>
                  ))}
                  <p className="mt-2 text-[9px] font-extrabold uppercase tracking-wide text-ink-muted">Skills</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {ex.skills.map((s) => <span key={s} className="rounded bg-surface-alt px-1.5 py-0.5 text-[8px] font-bold text-ink-secondary">{s}</span>)}
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-extrabold text-ink-primary">{ex.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-ink-secondary">{ex.blurb}</p>
                <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-muted">🕒 {ex.updated}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const testimonials = [
  { quote: "Interview Buddy is the future of job prep. It gave me perfectly tailored answers, anticipated follow-up questions, and helped me calm my nerves. Worth every penny!", name: "Jason T.", role: "Sales Executive" },
  { quote: "I uploaded my resume, got a detailed score with fixes, and rebuilt it in an hour. Two interviews the same week.", name: "Priya S.", role: "Data Analyst" },
  { quote: "The mock interviews felt real — adaptive follow-ups and honest scoring. I walked into my final round confident.", name: "Marcus L.", role: "Software Engineer" },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid items-center gap-10 rounded-modal border border-border bg-surface p-8 shadow-card lg:grid-cols-2 sm:p-12">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-primary">Succeed</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-primary md:text-4xl">
            Get real-time interview help and detailed, personal feedback
          </h2>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link href="/register" className="inline-flex items-center gap-2 rounded-pill bg-primary px-6 py-3 text-sm font-extrabold text-white shadow-[0_3px_0_#4b31d1] transition hover:bg-primary-hover">
              Start now →
            </Link>
            <span className="text-sm font-bold text-success">★★★★★ <span className="ml-1 font-semibold text-ink-secondary">4.7 · 367 Ratings</span></span>
          </div>
          <div className="mt-10 border-l-2 border-primary/30 pl-5">
            <p className="text-sm leading-7 text-ink-secondary">“{testimonials[0].quote}”</p>
            <p className="mt-3 text-sm font-extrabold text-ink-primary">{testimonials[0].name} <span className="font-semibold text-ink-muted">· {testimonials[0].role}</span></p>
          </div>
        </div>
        <div className="relative hidden overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 via-blue-500 to-orange-400 p-6 lg:block">
          <div className="rounded-xl bg-white/15 p-3 backdrop-blur">
            <div className="flex items-center gap-2 rounded-pill bg-white/90 px-3 py-1.5 text-[10px] font-bold text-ink-primary">
              ● Answer <span className="ml-auto text-ink-muted">⌘A · Reset ⌘R</span>
            </div>
            <div className="mt-3 rounded-xl bg-white/90 p-3">
              <p className="text-[11px] font-extrabold text-ink-primary">Our enterprise sales cycle is 120 days; how would you shorten it?</p>
              <p className="mt-2 rounded-lg bg-primary-soft p-2 text-[10px] leading-4 text-ink-secondary">
                Map each account to a buying-committee heat-map, surface user-specific ROI dashboards in week 1, and secure a technical pilot inside 30 days. This approach trimmed InnovateX’s cycle to 75 days and grew win-rate by 11%.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
