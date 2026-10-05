import { Footer } from "@/components/marketing/Footer";
import { TopNav } from "@/components/marketing/TopNav";

export const metadata = {
  title: "Contact Interview AI",
  description: "Contact Interview AI for support, partnerships, media, careers, and privacy questions.",
};

export default function ContactPage() {
  return (
    <>
      <TopNav />
      <main className="bg-surface">
        <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
          <div className="rounded-3xl border border-border bg-surface-alt p-6 shadow-sm sm:p-8 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Contact</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-primary md:text-5xl">
              We&apos;d Love to Hear From You.
            </h1>

            <div className="mt-8 space-y-6 text-base leading-8 text-ink-secondary">
              <p>
                Whether you have a question, feedback, partnership proposal, technical issue, or business inquiry,
                our team is here to help.
              </p>
            </div>

            <section className="mt-10 space-y-6">
              <div className="rounded-2xl border border-border bg-surface p-5">
                <h2 className="text-xl font-bold text-ink-primary">General Support</h2>
                <p className="mt-3 text-ink-secondary">
                  <a href="mailto:vp4647115@gmail.com" className="text-primary underline">vp4647115@gmail.com</a>
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-5">
                <h2 className="text-xl font-bold text-ink-primary">Business & Partnerships</h2>
                <p className="mt-3 text-ink-secondary">
                  <a href="mailto:vp4647115@gmail.com" className="text-primary underline">vp4647115@gmail.com</a>
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-5">
                <h2 className="text-xl font-bold text-ink-primary">Press & Media</h2>
                <p className="mt-3 text-ink-secondary">
                  <a href="mailto:vp4647115@gmail.com" className="text-primary underline">vp4647115@gmail.com</a>
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-5">
                <h2 className="text-xl font-bold text-ink-primary">Careers</h2>
                <p className="mt-3 text-ink-secondary">
                  <a href="mailto:vp4647115@gmail.com" className="text-primary underline">vp4647115@gmail.com</a>
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-5">
                <h2 className="text-xl font-bold text-ink-primary">Privacy</h2>
                <p className="mt-3 text-ink-secondary">
                  <a href="mailto:vp4647115@gmail.com" className="text-primary underline">vp4647115@gmail.com</a>
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-5">
                <h2 className="text-xl font-bold text-ink-primary">Grievance</h2>
                <p className="mt-3 text-ink-secondary">
                  <a href="mailto:vp4647115a@gmail.com" className="text-primary underline">vp4647115a@gmail.com</a>
                </p>
              </div>
            </section>

            <section className="mt-10 rounded-2xl border border-border bg-surface p-5">
              <h2 className="text-2xl font-bold text-ink-primary">Send Us a Message</h2>
              <form className="mt-5 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-ink-primary">Name</label>
                  <input placeholder="Your name" className="w-full rounded-input border border-border bg-white px-4 py-3 text-sm text-ink-primary placeholder:text-ink-muted focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-ink-primary">Email</label>
                  <input type="email" placeholder="Your email" className="w-full rounded-input border border-border bg-white px-4 py-3 text-sm text-ink-primary placeholder:text-ink-muted focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-ink-primary">Subject</label>
                  <input placeholder="What can we help with?" className="w-full rounded-input border border-border bg-white px-4 py-3 text-sm text-ink-primary placeholder:text-ink-muted focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-ink-primary">Message</label>
                  <textarea rows={5} placeholder="Write your message" className="w-full rounded-input border border-border bg-white px-4 py-3 text-sm text-ink-primary placeholder:text-ink-muted focus:border-primary focus:outline-none" />
                </div>
                <button type="button" className="rounded-input bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover">
                  Send Message
                </button>
              </form>
            </section>

            <div className="mt-10 rounded-2xl border border-border bg-surface p-5">
              <h3 className="text-xl font-bold text-ink-primary">Interview AI</h3>
              <p className="mt-2 text-ink-secondary">Prepare Better. Communicate Better. Interview Better.</p>
              <p className="mt-2 text-ink-secondary">
                <a href="https://www.intervai.vpnpro.in" className="text-primary underline">www.intervai.vpnpro.in</a>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
