import { TestimonialRow } from "@/components/ui/SocialProof";

// Right-hand trust panel for the split auth layout (design.md §8).
export function AuthTrustPanel() {
  return (
    <aside className="hero-gradient hidden flex-1 items-center justify-center p-12 lg:flex">
      <div className="max-w-md space-y-8">
        <h2 className="text-3xl font-extrabold leading-snug">
          Practice that turns into <span className="text-primary">offers</span>
        </h2>
        <ul className="space-y-4 text-sm text-ink-secondary">
          <li>✓ Realistic, adaptive AI interviewer</li>
          <li>✓ Structured scores with written evidence</li>
          <li>✓ Personalized practice plan after every session</li>
        </ul>
        <TestimonialRow quote="I walked into my real interview feeling ready" author="James L." />
      </div>
    </aside>
  );
}
