import { Footer } from "@/components/marketing/Footer";
import { TopNav } from "@/components/marketing/TopNav";

export const metadata = {
  title: "Interview Question Bank | IntervAi",
  description: "Practice common HR, behavioral, technical, coding, and software-development interview questions.",
};

const questionGroups = [
  { title: "HR Interview Questions", subtitle: "Beginner", questions: ["Tell me about yourself.", "Walk me through your resume.", "Why do you want to join our company?", "Why should we hire you?", "What are your strengths?", "What is your biggest weakness?", "Where do you see yourself in five years?", "Why did you choose this career?", "What motivates you?", "What are your career goals?"] },
  { title: "Behavioral Questions", questions: ["Tell me about a difficult problem you solved.", "Tell me about a time you made a mistake.", "Describe a time you worked under pressure.", "Tell me about a conflict within a team.", "Describe a time you demonstrated leadership.", "Tell me about a failure and what you learned.", "Describe a situation where you had to learn something quickly.", "Tell me about a time you disagreed with someone.", "Describe your biggest achievement.", "Tell me about a time you received difficult feedback."] },
  { title: "Technical: Programming", questions: ["What is object-oriented programming?", "Explain inheritance.", "What is polymorphism?", "What is encapsulation?", "What is abstraction?", "What is the difference between a compiler and interpreter?", "What is recursion?", "What is exception handling?", "What is memory management?", "What is time complexity?"] },
  { title: "Data Structures & Algorithms", questions: ["What is an array?", "What is a linked list?", "Stack vs queue?", "What is a binary tree?", "What is a binary search tree?", "Explain BFS and DFS.", "What is binary search?", "Explain sorting algorithms.", "What is Big-O notation?", "What is dynamic programming?"] },
  { title: "DBMS Questions", questions: ["What is a database?", "What is DBMS?", "What is SQL?", "What is normalization?", "What is a primary key?", "What is a foreign key?", "What is a JOIN?", "What is a transaction?", "What is ACID?", "What is an index?"] },
  { title: "Operating Systems", questions: ["What is an operating system?", "Process vs thread?", "What is multitasking?", "What is virtual memory?", "What is deadlock?", "Explain scheduling algorithms.", "What is a context switch?", "What is paging?", "What is memory management?", "What is a system call?"] },
  { title: "Computer Networks", questions: ["What is a computer network?", "Explain the OSI model.", "TCP vs UDP?", "What is an IP address?", "IPv4 vs IPv6?", "What is DNS?", "What is HTTP?", "HTTP vs HTTPS?", "What is a subnet?", "What is a MAC address?"] },
  { title: "Project Questions", subtitle: "Especially useful for freshers", questions: ["Explain your project.", "Why did you choose this project?", "What problem does it solve?", "What technologies did you use?", "What was your role?", "What was the biggest challenge?", "How did you solve that challenge?", "What would you improve?", "What did you learn?", "How would you scale the project?"] },
];

const codingTiers = [
  { level: "Easy", items: ["Reverse a string", "Find the maximum element", "Check palindrome", "Count character frequency", "Find duplicates"] },
  { level: "Medium", items: ["Two Sum", "Merge intervals", "Longest substring", "Linked-list operations", "Binary-tree traversal"] },
  { level: "Advanced", items: ["Dynamic programming", "Graph algorithms", "Backtracking", "Advanced tree problems", "System-design problems"] },
];

export default function QuestionBankPage() {
  return (
    <>
      <TopNav />
      <main className="bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <header className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Question Bank</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-primary md:text-5xl">Practice the Questions That Matter.</h1>
            <p className="mt-5 text-lg leading-8 text-ink-secondary">Practice questions commonly asked across HR, technical, behavioral, coding, and software-development interviews.</p>
          </header>

          <div className="mt-12 space-y-8">
            {questionGroups.map((group) => (
              <section key={group.title} className="rounded-2xl border border-border bg-surface-alt p-6 sm:p-8">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-2xl font-bold text-ink-primary">{group.title}</h2>
                  {group.subtitle && <p className="text-sm font-medium text-primary">{group.subtitle}</p>}
                </div>
                <ol className="mt-5 grid gap-x-8 gap-y-3 text-ink-secondary md:grid-cols-2">
                  {group.questions.map((question, index) => <li key={question} className="flex gap-3 leading-7"><span className="w-6 shrink-0 text-sm font-semibold text-ink-muted">{String(index + 1).padStart(2, "0")}</span><span>{question}</span></li>)}
                </ol>
                {group.title === "Behavioral Questions" && <p className="mt-6 rounded-xl bg-primary-soft p-4 text-sm leading-6 text-ink-primary"><strong>Recommended framework:</strong> STAR — Situation, Task, Action, Result.</p>}
              </section>
            ))}
          </div>

          <section className="mt-8 rounded-2xl border border-border bg-surface-alt p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-ink-primary">Coding Practice</h2>
            <p className="mt-2 leading-7 text-ink-secondary">Work through problems at a level that challenges you.</p>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {codingTiers.map((tier) => <div key={tier.level}><h3 className="font-bold text-ink-primary">{tier.level}</h3><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-ink-secondary">{tier.items.map((item) => <li key={item}>{item}</li>)}</ul></div>)}
            </div>
          </section>

          <section className="mt-8 flex flex-col gap-4 rounded-2xl bg-primary-soft p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div><h2 className="text-2xl font-bold text-ink-primary">Read. Think. Answer. Review. Improve.</h2><p className="mt-2 leading-7 text-ink-secondary">Don&apos;t just read questions. Turn your practice into an interactive mock interview.</p></div>
            <a href="/mock-interviews" className="inline-flex shrink-0 items-center justify-center rounded-input bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover">Practice With AI</a>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}