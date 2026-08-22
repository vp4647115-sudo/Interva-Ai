import { TopNav } from "@/components/marketing/TopNav";
import { Hero } from "@/components/marketing/Hero";
import { ValueSection } from "@/components/marketing/ValueSection";
import { CTABanner } from "@/components/marketing/CTABanner";
import { FAQItem } from "@/components/ui/FAQItem";
import { Footer } from "@/components/marketing/Footer";

const faqs = [
  {
    question: "How realistic are the AI interviews?",
    answer:
      "The interviewer adapts to your answers — asking follow-ups, adjusting difficulty, and probing deeper, just like a real interviewer would.",
  },
  {
    question: "What roles and topics are supported?",
    answer:
      "Software engineering (frontend, backend, full-stack), data, SQL, system design, and behavioral interviews, with more roles added regularly.",
  },
  {
    question: "How is my performance scored?",
    answer:
      "Each answer is evaluated against a structured rubric — technical correctness, communication, problem solving, relevance, and clarity — with written evidence for every score.",
  },
  {
    question: "Is my resume and interview data private?",
    answer:
      "Yes. Your data is only used to personalize your practice. Nothing is shared, and you can request deletion of your history at any time.",
  },
];

export default function LandingPage() {
  return (
    <>
      <TopNav />
      <main>
        <Hero />
        <ValueSection />
        <CTABanner />
        <section id="faq" className="mx-auto max-w-3xl px-6 pb-24">
          <h2 className="text-center text-3xl font-bold md:text-4xl">Frequently asked questions</h2>
          <div className="mt-10 space-y-4">
            {faqs.map((f) => (
              <FAQItem key={f.question} question={f.question} answer={f.answer} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
