import { Footer } from "@/components/marketing/Footer";
import { TopNav } from "@/components/marketing/TopNav";

export const metadata = {
  title: "Frequently Asked Questions | IntervAi",
  description: "Answers to common questions about Interview AI, practice, features, privacy, and subscriptions.",
};

const faqs = [
  { question: "What is Interview AI?", answer: "Interview AI is an AI-powered interview preparation platform that helps users practice interviews, improve communication, analyze resumes, and prepare for career opportunities." },
  { question: "Is Interview AI a real interviewer?", answer: "Interview AI uses artificial intelligence to simulate interview experiences. It is designed for practice and preparation, not to replace a human interviewer." },
  { question: "Who is Interview AI for?", answer: "Interview AI can be useful for students, freshers, job seekers, developers, professionals, career changers, and anyone preparing for an interview." },
  { question: "Can freshers use Interview AI?", answer: "Absolutely. Interview AI can help freshers practice common HR, behavioral, technical, and project-related questions." },
  { question: "Can I practice technical interviews?", answer: "Yes, where technical interview features are available." },
  { question: "Can I practice coding interviews?", answer: "Coding practice may be available depending on your plan and current product features." },
  { question: "Can Interview AI analyze my resume?", answer: "Yes, if the Resume Analyzer feature is available for your account." },
  { question: "Does Interview AI guarantee a job?", answer: "No. Interview AI is a preparation tool and cannot guarantee an interview, job offer, salary, promotion, or other career outcome." },
  { question: "Are the AI scores accurate?", answer: "AI scores are guidance, not an absolute measurement of your ability. AI can make mistakes and should not be treated as a perfect evaluator." },
  { question: "Does Interview AI record my voice?", answer: "Certain voice-based features may process or record audio depending on how the feature is designed and the permissions you provide. See the Privacy Policy for details." },
  { question: "Does Interview AI use my camera?", answer: "Only features requiring camera access should request camera permissions. You can choose whether to use those features where available." },
  { question: "Can I use Interview AI on mobile?", answer: "Interview AI is designed to support modern devices where the relevant feature is available. Browser and feature compatibility may vary." },
  { question: "Can I practice in multiple languages?", answer: "Language availability depends on the current Interview AI implementation and supported AI models." },
  { question: "Is Interview AI free?", answer: "Interview AI may provide free and paid features depending on current plans. Check the pricing page for the latest information." },
  { question: "Can I cancel my subscription?", answer: "If you have a subscription, you can cancel future renewals through the available subscription-management options, subject to applicable terms." },
  { question: "How do I delete my account?", answer: <>Use the available account-deletion functionality or contact <a className="text-primary underline" href="mailto:vp4647115@gmail.com">vp4647115@gmail.com</a>.</> },
  { question: "How do I contact Interview AI?", answer: <>For general support and inquiries, email <a className="text-primary underline" href="mailto:vp4647115@gmail.com">vp4647115@gmail.com</a>.</> },
  { question: "Can I use AI during a real job interview?", answer: "Interview AI is designed primarily for preparation and practice. Do not use AI to secretly answer questions or deceive an interviewer where prohibited by the employer, institution, or applicable rules." },
  { question: "Can AI-generated answers be wrong?", answer: "Yes. AI systems can produce inaccurate, incomplete, or outdated information. Review important information independently." },
  { question: "Is my information secure?", answer: <>Interview AI uses reasonable technical and organizational measures to protect information, but no internet service can guarantee absolute security. See our <a className="text-primary underline" href="/privacy">Privacy Policy</a> for more information.</> },
];

export default function FAQPage() {
  return (
    <>
      <TopNav />
      <main className="bg-surface">
        <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
          <header>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">FAQ</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-primary md:text-5xl">Everything You Need to Know About Interview AI.</h1>
          </header>
          <section aria-label="Frequently asked questions" className="mt-10 divide-y divide-border rounded-2xl border border-border bg-surface-alt px-5 sm:px-8">
            {faqs.map((faq) => <details key={faq.question} className="group py-5">
              <summary className="cursor-pointer list-none pr-8 text-lg font-semibold text-ink-primary">{faq.question}<span aria-hidden="true" className="float-right text-primary group-open:rotate-45">+</span></summary>
              <div className="mt-3 max-w-3xl leading-7 text-ink-secondary">{faq.answer}</div>
            </details>)}
          </section>
          <section className="mt-8 rounded-2xl bg-primary-soft p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-ink-primary">Where Can I Learn More?</h2>
            <p className="mt-2 leading-7 text-ink-secondary">Explore our interview resources or start practicing.</p>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold">
              <a className="text-primary underline" href="/interview-guides">Interview Guides</a>
              <a className="text-primary underline" href="/question-bank">Question Bank</a>
              <a className="text-primary underline" href="/help-center">Help Center</a>
              <a className="text-primary underline" href="/blog">Blog</a>
            </div>
            <a href="/mock-interviews" className="mt-6 inline-flex items-center justify-center rounded-input bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover">Start Preparing</a>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}