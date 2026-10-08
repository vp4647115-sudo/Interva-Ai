import { PillLink } from "@/components/ui/PillButton";
import { AvatarStack } from "@/components/ui/SocialProof";

export function CTABanner() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24">
      <div className="rounded-modal bg-primary px-8 py-16 text-center text-white md:px-16">
        <h2 className="text-3xl font-extrabold md:text-4xl">Your next offer starts with practice</h2>
        <p className="mx-auto mt-4 max-w-xl text-primary-soft/90">
          Create a free account, set your target role, and run your first AI mock interview in
          under five minutes.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4">
          <PillLink href="/auth/register" variant="success" size="lg">Get started free</PillLink>
          <div className="flex items-center gap-3 opacity-90">
            <AvatarStack names={["Priya Sharma", "James Lee", "Ana Costa", "Omar Haddad"]} />
            <span className="text-sm">Join thousands of candidates practicing daily</span>
          </div>
        </div>
      </div>
    </section>
  );
}
