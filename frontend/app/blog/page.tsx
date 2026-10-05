import { Footer } from "@/components/marketing/Footer";
import { TopNav } from "@/components/marketing/TopNav";

export const metadata = {
  title: "Interview AI Blog | IntervAi",
  description: "Practical interview advice, technical preparation, career insights, and AI-powered learning resources.",
};

const articles = [
  { title: "How to Answer ‘Tell Me About Yourself’ in an Interview", description: "Create a clear, confident introduction that connects your experience, skills, and career goals.", category: "Interview Preparation" },
  { title: "25 Most Common HR Interview Questions", description: "Prepare for questions recruiters use to understand your background, motivation, communication, and goals.", category: "HR & Behavioral" },
  { title: "How to Prepare for Your First Technical Interview", description: "A practical roadmap for students and freshers preparing for their first technical interview.", category: "Technical Interviews" },
  { title: "How to Explain Your Project in an Interview", description: "Explain your project clearly, from the problem and technology stack to your contribution and results.", category: "Interview Preparation" },
  { title: "STAR Method: How to Answer Behavioral Interview Questions", description: "Structure behavioral answers using Situation, Task, Action, and Result.", category: "HR & Behavioral" },
  { title: "Common Resume Mistakes That Can Hurt Your Interview", description: "Spot common resume problems and improve your resume before sending it to recruiters.", category: "Resume & Career" },
];

const categories = [
  { title: "Interview Preparation", description: "Guides and strategies for preparing for interviews." },
  { title: "Technical Interviews", description: "Programming, computer science, system design, databases, networking, and technical concepts." },
  { title: "HR & Behavioral", description: "Communication strategies and behavioral interview preparation." },
  { title: "Resume & Career", description: "Resume improvement, career planning, job-search strategies, and professional development." },
  { title: "Coding", description: "Programming problems, algorithms, data structures, and coding interview preparation." },
  { title: "AI & Careers", description: "How artificial intelligence is changing career preparation and the modern hiring process." },
];

const upcomingTopics = ["Interview strategies", "Technical questions", "Coding problems", "Resume advice", "Communication skills", "Career development", "AI tools", "Industry trends", "Interview experiences", "Learning resources"];

export default function BlogPage() {
  return (
    <>
      <TopNav />
      <main className="bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <header className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Interview AI Blog</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-primary md:text-5xl">Learn. Practice. Improve. Get Interview-Ready.</h1>
            <p className="mt-5 text-lg leading-8 text-ink-secondary">Practical advice, interview strategies, technical preparation, career insights, and AI-powered learning resources to help you perform better when it matters.</p>
          </header>

          <section className="mt-12">
            <h2 className="text-2xl font-bold text-ink-primary">Featured Articles</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {articles.map((article) => <article key={article.title} className="flex flex-col rounded-2xl border border-border bg-surface-alt p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">{article.category}</p>
                <h3 className="mt-3 text-xl font-bold leading-snug text-ink-primary">{article.title}</h3>
                <p className="mt-3 flex-1 leading-7 text-ink-secondary">{article.description}</p>
              </article>)}
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-bold text-ink-primary">Categories</h2>
            <div className="mt-5 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => <article key={category.title} className="border-t-2 border-primary pt-4">
                <h3 className="font-bold text-ink-primary">{category.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-secondary">{category.description}</p>
              </article>)}
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-border bg-surface-alt p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-ink-primary">Latest From Interview AI</h2>
            <p className="mt-2 leading-7 text-ink-secondary">We'll publish new articles covering:</p>
            <ul className="mt-5 grid list-disc gap-x-8 gap-y-2 pl-5 text-ink-secondary sm:grid-cols-2 lg:grid-cols-3">
              {upcomingTopics.map((topic) => <li key={topic}>{topic}</li>)}
            </ul>
          </section>

          <section className="mt-8 rounded-2xl bg-primary-soft p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-ink-primary">Get Better at Interviews.</h2>
            <p className="mt-2 leading-7 text-ink-secondary">Get practical interview tips, new guides, question collections, and career resources delivered to your inbox. You can unsubscribe at any time.</p>
            <a href="/contact" className="mt-5 inline-flex items-center justify-center rounded-input border border-primary px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white">Contact us about the newsletter</a>
          </section>

          <section className="mt-8 flex flex-col gap-4 rounded-2xl border border-border bg-surface-alt p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div><h2 className="text-2xl font-bold text-ink-primary">Reading is only the first step.</h2><p className="mt-2 leading-7 text-ink-secondary">Practice your next interview with Interview AI.</p></div>
            <a href="/mock-interviews" className="inline-flex shrink-0 items-center justify-center rounded-input bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover">Start Mock Interview</a>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}