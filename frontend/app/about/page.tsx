import { Footer } from "@/components/marketing/Footer";
import { TopNav } from "@/components/marketing/TopNav";

export const metadata = {
  title: "About Interview AI | IntervAi",
  description: "Learn more about Interview AI and our mission to make interview preparation accessible and practical.",
};

export default function AboutPage() {
  return (
    <>
      <TopNav />
      <main className="bg-surface">
        <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
          <div className="rounded-3xl border border-border bg-surface-alt p-6 shadow-sm sm:p-8 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">About Interview AI</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-primary md:text-5xl">
              Prepare Better. Communicate Better. Interview Better.
            </h1>

            <div className="mt-8 space-y-6 text-base leading-8 text-ink-secondary">
              <p>
                Interview AI is an AI-powered interview preparation platform built to help people become more
                confident, prepared, and effective in interviews.
              </p>
              <p>
                We combine artificial intelligence, interactive mock interviews, resume analysis, communication
                practice, and personalized feedback to create a practical environment where users can prepare before
                the real opportunity arrives.
              </p>
            </div>

            <section className="mt-10">
              <h2 className="text-2xl font-bold text-ink-primary">Our Mission</h2>
              <p className="mt-3 text-ink-secondary leading-7">
                Our mission is simple: <strong>Make high-quality interview preparation accessible to everyone.</strong>
              </p>
              <p className="mt-3 text-ink-secondary leading-7">
                Interviews should measure what you can do—not how much you paid for coaching or how many resources
                you had access to. Interview AI helps users practice repeatedly, understand their weaknesses,
                improve their communication, and walk into interviews with greater confidence.
              </p>
            </section>

            <section className="mt-10">
              <h2 className="text-2xl font-bold text-ink-primary">What We Build</h2>
              <ul className="mt-4 list-disc space-y-2 pl-6 text-ink-secondary leading-7">
                <li>AI-powered mock interviews</li>
                <li>Technical interview practice</li>
                <li>HR interview preparation</li>
                <li>Resume analysis</li>
                <li>AI-powered feedback</li>
                <li>Communication practice</li>
                <li>Voice-based interview experiences</li>
                <li>Personalized preparation</li>
                <li>Career-focused learning tools</li>
              </ul>
            </section>

            <section className="mt-10">
              <h2 className="text-2xl font-bold text-ink-primary">Built Around Practice</h2>
              <p className="mt-3 text-ink-secondary leading-7">
                Reading interview tips is useful. <strong>Actually practicing is better.</strong>
              </p>
              <p className="mt-3 text-ink-secondary leading-7">
                Interview AI is designed around repetition, feedback, and improvement—giving users an environment
                where they can make mistakes, learn from them, and try again.
              </p>
            </section>

            <section className="mt-10">
              <h2 className="text-2xl font-bold text-ink-primary">Our Vision</h2>
              <p className="mt-3 text-ink-secondary leading-7">
                We envision a future where every student, graduate, developer, and professional can access an
                intelligent personal interview coach whenever they need one.
              </p>
              <p className="mt-3 text-ink-secondary leading-7 font-semibold text-ink-primary">
                Your next interview shouldn&apos;t be your first practice.
              </p>
            </section>

            <section className="mt-10 rounded-2xl border border-border bg-surface p-5">
              <h2 className="text-2xl font-bold text-ink-primary">Contact</h2>
              <p className="mt-3 text-ink-secondary leading-7">
                Have a question, partnership idea, or feedback?
              </p>
              <p className="mt-2 text-ink-secondary leading-7">
                <a href="mailto:vp4647115@gmail.com" className="text-primary underline">vp4647115@gmail.com</a>
              </p>
              <p className="mt-2 text-ink-secondary leading-7">
                <a href="https://www.intervai.vpnpro.in" className="text-primary underline">www.intervai.vpnpro.in</a>
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
