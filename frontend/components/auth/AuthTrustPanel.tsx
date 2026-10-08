import Image from "next/image";
import { TestimonialRow } from "@/components/ui/SocialProof";
import Link from "next/link";

// Right-hand trust panel for the split auth layout (design.md §8).
export function AuthTrustPanel() {
  return (
    <aside className="relative hidden flex-1 flex-col overflow-hidden bg-gradient-to-br from-primary via-[#5B3FE6] to-[#3B2A9F] lg:flex">
      {/* decorative purple glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-pink-accent/20 blur-3xl"
      />
      {/* distinct auth header */}
      <header className="relative flex items-center justify-between px-12 py-8 text-white">
        <Link href="/" className="text-xl font-extrabold tracking-tight">
          Interv<span className="text-pink-accent">Ai</span>
        </Link>
        <span className="rounded-pill border border-white/30 px-4 py-1.5 text-xs font-semibold">
          Trusted by 12,000+ candidates
        </span>
      </header>
      <div className="relative flex flex-1 items-center justify-center p-12 pt-0">
        <div className="max-w-md space-y-8 text-white">
          <h2 className="text-3xl font-extrabold leading-snug">
            Practice that turns into{" "}
            <span className="bg-gradient-to-r from-lavender to-pink-accent bg-clip-text text-transparent">
              offers
            </span>
          </h2>
          <ul className="space-y-4 text-sm text-white/85">
            <li>✓ Realistic, adaptive AI interviewer</li>
            <li>✓ Structured scores with written evidence</li>
            <li>✓ Personalized practice plan after every session</li>
          </ul>
          <Image
            src="/candidate-interview.svg"
            alt="Candidate preparing confidently for an interview"
            width={600}
            height={375}
            priority
            className="aspect-[16/10] w-full rounded-card object-cover shadow-modal"
          />
          <TestimonialRow quote="I walked into my real interview feeling ready" author="James L." />
        </div>
      </div>
    </aside>
  );
}
