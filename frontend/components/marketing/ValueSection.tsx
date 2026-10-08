import Image from "next/image";

const features = [
  {
    title: "Role-specific questions",
    body: "Adaptive AI picks questions for your target role, difficulty, and experience level — no generic question dumps.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80&auto=format&fit=crop",
    alt: "Developer preparing for a role-specific interview",
  },
  {
    title: "Evidence-based scoring",
    body: "Every answer gets a structured evaluation across technical depth, communication, and problem solving — with proof, not just a number.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80&auto=format&fit=crop",
    alt: "Analytics dashboard showing detailed performance scores",
  },
  {
    title: "Personalized practice plan",
    body: "Weak areas are tracked across sessions and turned into a concrete plan so every mock makes you better.",
    image:
      "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&q=80&auto=format&fit=crop",
    alt: "Person planning study sessions in a notebook",
  },
];

export function ValueSection() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-24">
      <h2 className="mx-auto max-w-2xl text-center text-3xl font-bold md:text-4xl">
        Practice like it&apos;s the real interview
      </h2>
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="overflow-hidden rounded-card bg-surface shadow-card transition-transform hover:-translate-y-0.5"
          >
            <Image
              src={f.image}
              alt={f.alt}
              width={600}
              height={375}
              className="aspect-[16/10] w-full object-cover"
            />
            <div className="p-8">
              <h3 className="text-lg font-bold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                {f.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
