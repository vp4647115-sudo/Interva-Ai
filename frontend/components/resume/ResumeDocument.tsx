import type { ResumeDraft, ResumeTemplate } from "@/components/resume/types";

export default function ResumeDocument({ draft, template }: { draft: ResumeDraft; template: ResumeTemplate }) {
  const accent = template === "modern" ? "#6C4CFF" : template === "professional" ? "#0F766E" : "#111111";
  const headingClass = template === "minimal" ? "uppercase tracking-[0.18em]" : "uppercase tracking-[0.1em]";

  const cleanName = (draft.name || "").startsWith("%PDF-") ? "Professional Candidate" : (draft.name || "Your Name");

  return (
    <article className={`resume-paper resume-${template} bg-white p-8 text-[#17202a] shadow-card sm:p-10`} style={{ "--resume-accent": accent } as React.CSSProperties}>
      <header className="border-b-2 border-[var(--resume-accent)] pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight">{cleanName}</h1>
        <p className="mt-1 text-base font-semibold" style={{ color: accent }}>{draft.role || "Target role"}</p>
        <p className="mt-3 text-xs text-[#59636e]">
          {[draft.email, draft.phone, draft.location, draft.linkedin].filter(Boolean).join("  |  ") || "email@example.com  |  City, Country"}
        </p>
      </header>

      <div className="mt-6 space-y-5 text-[11px] leading-[1.55]">
        {draft.summary && (
          <section>
            <h2 className={`mb-2 text-[10px] font-extrabold text-[var(--resume-accent)] ${headingClass}`}>Profile</h2>
            <p>{draft.summary}</p>
          </section>
        )}

        {draft.skills.length > 0 && (
          <section>
            <h2 className={`mb-2 text-[10px] font-extrabold text-[var(--resume-accent)] ${headingClass}`}>Skills</h2>
            <p>{draft.skills.join("  |  ")}</p>
          </section>
        )}

        {draft.experience.length > 0 && (
          <section>
            <h2 className={`mb-2 text-[10px] font-extrabold text-[var(--resume-accent)] ${headingClass}`}>Experience</h2>
            <div className="space-y-4">
              {draft.experience.map((item) => (
                <div key={item.id}>
                  <div className="flex justify-between gap-3 font-bold">
                    <span>{item.title}{item.company ? `, ${item.company}` : ""}</span>
                    <span className="shrink-0 font-semibold text-[#59636e]">{item.dates}</span>
                  </div>
                  <p className="mt-1 whitespace-pre-line">{item.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {draft.projects.length > 0 && (
          <section>
            <h2 className={`mb-2 text-[10px] font-extrabold text-[var(--resume-accent)] ${headingClass}`}>Projects</h2>
            <div className="space-y-3">
              {draft.projects.map((item) => (
                <div key={item.id}>
                  <p className="font-bold">{item.name}{item.technologies ? ` | ${item.technologies}` : ""}</p>
                  <p className="mt-1">{item.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {(draft.degree || draft.school) && (
          <section>
            <h2 className={`mb-2 text-[10px] font-extrabold text-[var(--resume-accent)] ${headingClass}`}>Education</h2>
            <p className="font-bold">{draft.degree}{draft.degree && draft.school ? " | " : ""}{draft.school}</p>
          </section>
        )}
      </div>
    </article>
  );
}
