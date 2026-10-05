import { Footer } from "@/components/marketing/Footer";
import { TopNav } from "@/components/marketing/TopNav";

export const metadata = {
  title: "Press Kit | Interview AI",
  description: "Press kit for Interview AI with company overview, product details, and media contact information.",
};

export default function PressKitPage() {
  return (
    <>
      <TopNav />
      <main className="bg-surface">
        <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
          <div className="rounded-3xl border border-border bg-surface-alt p-6 shadow-sm sm:p-8 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Press Kit</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-primary md:text-5xl">
              Interview AI in the Media
            </h1>

            <section className="mt-8">
              <h2 className="text-2xl font-bold text-ink-primary">About Interview AI</h2>
              <p className="mt-3 text-ink-secondary leading-7">
                Interview AI is an AI-powered interview preparation platform built to help people become more
                confident, prepared, and effective in interviews.
              </p>
              <p className="mt-3 text-ink-secondary leading-7">
                We combine artificial intelligence, mock interviews, resume analysis, communication practice,
                personalized feedback, and practical coaching to create a more realistic preparation experience.
              </p>
            </section>

            <section className="mt-10">
              <h2 className="text-2xl font-bold text-ink-primary">What We Offer</h2>
              <ul className="mt-4 list-disc space-y-2 pl-6 text-ink-secondary leading-7">
                <li>AI mock interviews</li>
                <li>Resume analysis</li>
                <li>Technical and HR interview preparation</li>
                <li>Communication improvement</li>
                <li>Voice and interview practice</li>
                <li>Career-focused learning tools</li>
              </ul>
            </section>

            <section className="mt-10">
              <h2 className="text-2xl font-bold text-ink-primary">Mission</h2>
              <p className="mt-3 text-ink-secondary leading-7">
                Our mission is to make high-quality interview preparation accessible to everyone. We believe users
                should be able to improve their interview readiness without being limited by cost, access, or coaching
                availability.
              </p>
            </section>

            <section className="mt-10 rounded-2xl border border-border bg-surface p-5">
              <h2 className="text-2xl font-bold text-ink-primary">Media Contact</h2>
              <p className="mt-3 text-ink-secondary leading-7">
                For media inquiries, interviews, publications, and press requests:
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
