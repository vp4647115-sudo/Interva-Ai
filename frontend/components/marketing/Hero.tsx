import { AvatarStack, TestimonialRow } from "@/components/ui/SocialProof";
import { PillLink } from "@/components/ui/PillButton";

export function Hero() {
  return (
    <section className="hero-gradient relative overflow-hidden">
      {/* large soft curved shape toward the lower half (design.md §7) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-64 left-1/2 h-[560px] w-[1400px] -translate-x-1/2 rounded-[100%] bg-white/70 blur-2xl"
      />
      <div className="relative mx-auto max-w-4xl px-6 py-24 text-center md:py-32">
        <p className="text-sm font-semibold text-ink-secondary">
          ★★★★★ Trusted by 12,000+ candidates
        </p>
        <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight md:text-6xl md:leading-[1.1]">
          Ace your next interview with{" "}
          <span className="bg-gradient-to-r from-primary to-pink-accent bg-clip-text text-transparent">
            AI-powered practice
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ink-secondary md:text-lg">
          Run realistic, role-specific mock interviews with an AI interviewer. Get structured
          scores, evidence-based feedback, and a personalized practice plan after every session.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4">
          <PillLink href="/auth/register" size="lg">Start practicing free</PillLink>
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
            <AvatarStack names={["Priya Sharma", "James Lee", "Ana Costa", "Omar Haddad"]} />
            <TestimonialRow quote="Felt exactly like the real thing" author="Priya S." />
          </div>
        </div>
      </div>
    </section>
  );
}
