import Image from "next/image";
import { AvatarStack, TestimonialRow } from "@/components/ui/SocialProof";
import { PillLink } from "@/components/ui/PillButton";

export function Hero() {
  return (
    <section className="hero-gradient relative overflow-hidden">
      {/* large soft curved shape toward the lower half (design.md §7) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-64 left-1/2 h-[560px] w-[1400px] -translate-x-1/2 rounded-[100%] bg-white/40 blur-3xl"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 md:grid-cols-2 md:py-32">
        <div className="text-center md:text-left">
          <p className="text-sm font-semibold text-ink-secondary">
            ★★★★★ Trusted by 12,000+ candidates
          </p>
          <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl xl:text-6xl">
            Ace your next interview with{" "}
            <span className="bg-gradient-to-r from-primary to-pink-accent bg-clip-text text-transparent">
              AI-powered practice
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink-secondary md:mx-0 md:text-lg">
            Run realistic, role-specific mock interviews with an AI interviewer. Get structured
            scores, evidence-based feedback, and a personalized practice plan after every session.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 md:items-start">
            <PillLink href="/auth/register" size="lg">Start practicing free</PillLink>
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
              <AvatarStack names={["Priya Sharma", "James Lee", "Ana Costa", "Omar Haddad"]} />
              <TestimonialRow quote="Felt exactly like the real thing" author="Priya S." />
            </div>
          </div>
        </div>
        <div className="relative hidden justify-self-center md:block">
          <div
            aria-hidden
            className="absolute -inset-4 rounded-card bg-gradient-to-br from-primary/20 to-pink-accent/10 blur-2xl"
          />
          <Image
            src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80&auto=format&fit=crop"
            alt="Candidate practicing a mock interview on a video call"
            width={800}
            height={600}
            className="relative w-full max-w-md rounded-card object-cover shadow-modal aspect-[4/3]"
          />
          <div className="absolute -bottom-5 -left-5 rounded-card bg-surface px-5 py-3 shadow-card">
            <p className="text-xs font-semibold text-ink-secondary">Interview score</p>
            <p className="text-lg font-extrabold text-success">92 / 100</p>
          </div>
        </div>
      </div>
    </section>
  );
}
