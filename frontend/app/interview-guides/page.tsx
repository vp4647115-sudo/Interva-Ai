import { Footer } from "@/components/marketing/Footer";
import { TopNav } from "@/components/marketing/TopNav";

export const metadata = {
  title: "Interview Guides | IntervAi",
  description: "Practical, step-by-step guides for HR, technical, coding, fresher, and software developer interviews.",
};

const guides = [
  {
    title: "How to Prepare for an Interview",
    intro: "A beginner-friendly guide to everything to do before an interview.",
    label: "Best for: Students, freshers, and first-time candidates",
    points: ["Research the company", "Understand the job description", "Prepare before the interview", "Practice common questions", "Prepare your introduction", "Plan for interview day"],
  },
  {
    title: "HR Interview Guide",
    intro: "Approach behavioral and HR questions with structured, specific answers.",
    label: "Recommended technique: STAR (Situation, Task, Action, Result)",
    points: ["Tell me about yourself", "Why should we hire you?", "What are your strengths and weaknesses?", "Why do you want to join our company?", "Where do you see yourself in five years?", "Why should we select you?"],
  },
  {
    title: "Technical Interview Guide",
    intro: "Combine fundamentals, problem-solving, and practical knowledge.",
    label: "Tip: Explain concepts in your own words instead of only memorizing definitions.",
    points: ["Programming fundamentals", "Data structures and algorithms", "Databases and operating systems", "Computer networks and object-oriented programming", "Projects and system design basics"],
  },
  {
    title: "Coding Interview Guide",
    intro: "Build a practical routine for programming and coding rounds.",
    label: "Practice solving problems while explaining your thought process.",
    points: ["Arrays and strings", "Linked lists, stacks, and queues", "Trees, searching, and sorting", "Recursion and dynamic programming", "Time and space complexity"],
  },
  {
    title: "Fresher Interview Guide",
    intro: "Prepare for the questions students and recent graduates are most likely to face.",
    label: "Remember: Projects can demonstrate practical ability even without years of work experience.",
    points: ["Education and academic experience", "Projects and internships", "Skills, strengths, and weaknesses", "Career goals", "How to discuss limited professional experience"],
  },
  {
    title: "Software Developer Interview Guide",
    intro: "Prepare for software-development roles with technical and behavioral practice.",
    label: "Preparation areas: Programming, computer science, development, and projects.",
    points: ["Java, Python, C++, JavaScript, and more", "DSA, DBMS, operating systems, networking, and OOP", "APIs, Git, databases, debugging, and testing", "Project architecture, decisions, challenges, and results"],
  },
  {
    title: "Resume-Based Interview Guide",
    intro: "Your resume can become the interviewer's question bank. Be ready to explain every important item.",
    label: "Golden rule: Never put something on your resume that you cannot confidently explain.",
    points: ["Projects and technologies", "Internships and work experience", "Certifications and achievements", "Education and skills"],
  },
];

const checklist = [
  "Research the company", "Understand the job description", "Review your resume", "Prepare your introduction",
  "Practice common questions", "Review technical fundamentals", "Prepare questions for the interviewer",
  "Test your camera and microphone", "Check your internet connection", "Prepare your interview environment", "Get enough rest",
];

export default function InterviewGuidesPage() {
  return (
    <>
      <TopNav />
      <main className="bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <header className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Interview Guides</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-primary md:text-5xl">Prepare With a Plan. Interview With Confidence.</h1>
            <p className="mt-5 text-lg leading-8 text-ink-secondary">Interviews become easier when you know what to expect. Explore practical, step-by-step resources for everything from your first HR round to technical interviews and final discussions.</p>
          </header>

          <section aria-label="Featured interview guides" className="mt-12 grid gap-5 md:grid-cols-2">
            {guides.map((guide, index) => (
              <article key={guide.title} className="rounded-2xl border border-border bg-surface-alt p-6 sm:p-7">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">Guide {String(index + 1).padStart(2, "0")}</p>
                <h2 className="mt-2 text-xl font-bold text-ink-primary">{guide.title}</h2>
                <p className="mt-3 leading-7 text-ink-secondary">{guide.intro}</p>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-ink-secondary">
                  {guide.points.map((point) => <li key={point}>{point}</li>)}
                </ul>
                <p className="mt-5 border-t border-border pt-4 text-sm font-medium leading-6 text-ink-primary">{guide.label}</p>
              </article>
            ))}
          </section>

          <section className="mt-10 rounded-2xl border border-border bg-surface-alt p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Before your interview</p>
            <h2 className="mt-2 text-2xl font-bold text-ink-primary">Final Interview Preparation Checklist</h2>
            <ul className="mt-5 grid gap-3 text-ink-secondary sm:grid-cols-2">
              {checklist.map((item) => <li key={item} className="flex items-start gap-3"><span aria-hidden="true" className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-border bg-surface text-primary">✓</span>{item}</li>)}
            </ul>
          </section>

          <section className="mt-10 flex flex-col gap-4 rounded-2xl bg-primary-soft p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div><h2 className="text-2xl font-bold text-ink-primary">Don&apos;t wait until interview day to practice.</h2><p className="mt-2 leading-7 text-ink-secondary">Simulate the experience, practice your answers, and find areas to improve.</p></div>
            <a href="/mock-interviews" className="inline-flex shrink-0 items-center justify-center rounded-input bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover">Start a Mock Interview</a>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}