const features = [
  {
    title: "Role-specific questions",
    body: "Adaptive AI picks questions for your target role, difficulty, and experience level — no generic question dumps.",
    icon: "🎯",
  },
  {
    title: "Evidence-based scoring",
    body: "Every answer gets a structured evaluation across technical depth, communication, and problem solving — with proof, not just a number.",
    icon: "📊",
  },
  {
    title: "Personalized practice plan",
    body: "Weak areas are tracked across sessions and turned into a concrete plan so every mock makes you better.",
    icon: "🧭",
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
          <div key={f.title} className="rounded-card bg-surface p-8 shadow-card transition-transform hover:-translate-y-0.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-2xl" aria-hidden>
              {f.icon}
            </div>
            <h3 className="mt-5 text-lg font-bold">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
