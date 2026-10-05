import { Footer } from "@/components/marketing/Footer";
import { TopNav } from "@/components/marketing/TopNav";

export const metadata = {
  title: "Careers at Interview AI | IntervAi",
  description: "Careers at Interview AI: build the future of interview preparation with AI, products, and user experience.",
};

export default function CareersPage() {
  return (
    <>
      <TopNav />
      <main className="bg-surface">
        <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
          <div className="rounded-3xl border border-border bg-surface-alt p-6 shadow-sm sm:p-8 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Careers at Interview AI</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-primary md:text-5xl">
              Help Build the Future of Interview Preparation.
            </h1>

            <div className="mt-8 space-y-6 text-base leading-8 text-ink-secondary">
              <p>
                We&apos;re building Interview AI to make career preparation more accessible, intelligent, and practical.
              </p>
              <p>
                We&apos;re looking for people who enjoy solving difficult problems, building great products, and creating
                technology that genuinely helps people.
              </p>
            </div>

            <section className="mt-10">
              <h2 className="text-2xl font-bold text-ink-primary">Why Interview AI?</h2>
              <p className="mt-3 text-ink-secondary leading-7">
                At Interview AI, you&apos;ll have the opportunity to work on problems involving:
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-6 text-ink-secondary leading-7">
                <li>Artificial intelligence</li>
                <li>Generative AI</li>
                <li>Voice technology</li>
                <li>Natural language processing</li>
                <li>Developer tools</li>
                <li>SaaS products</li>
                <li>Product design</li>
                <li>Career technology</li>
                <li>User experience</li>
                <li>Automation</li>
              </ul>
            </section>

            <section className="mt-10">
              <h2 className="text-2xl font-bold text-ink-primary">Who We&apos;re Looking For</h2>
              <p className="mt-3 text-ink-secondary leading-7">
                We&apos;re interested in people who are curious, creative, product-minded, comfortable learning quickly,
                passionate about technology, and focused on building useful products.
              </p>
              <p className="mt-3 text-ink-secondary leading-7">
                We value what you can build and how you think—not just the titles on your resume.
              </p>
            </section>

            <section className="mt-10 rounded-2xl border border-border bg-surface p-5">
              <h2 className="text-2xl font-bold text-ink-primary">Open Positions</h2>
              <p className="mt-3 text-ink-secondary leading-7">
                We currently list available opportunities here:
              </p>
              <p className="mt-3 text-ink-secondary leading-7">
                If there isn&apos;t a suitable position available, you can still introduce yourself.
              </p>
              <p className="mt-3 text-ink-secondary leading-7">
                <strong>Send your profile to:</strong>{" "}
                <a href="mailto:vp4647115@gmail.com" className="text-primary underline">vp4647115@gmail.com</a>
              </p>
              <p className="mt-4 text-ink-secondary leading-7">
                Please include:
              </p>
              <ul className="mt-2 list-disc space-y-2 pl-6 text-ink-secondary leading-7">
                <li>Your name</li>
                <li>Role you&apos;re interested in</li>
                <li>Resume / portfolio</li>
                <li>Relevant projects</li>
                <li>A short introduction</li>
              </ul>
            </section>

            <section className="mt-10">
              <h2 className="text-2xl font-bold text-ink-primary">Build With Us</h2>
              <p className="mt-3 text-ink-secondary leading-7">
                We&apos;re building more than an interview tool. We&apos;re building technology that can help people become
                better prepared for the opportunities that matter.
              </p>
              <p className="mt-3 text-ink-primary font-bold leading-7">Come build with us.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
