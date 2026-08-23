"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  apiClient,
  EducationEntry,
  ExperienceEntry,
  InterviewSession,
  ResumeEntry,
  SkillEntry,
} from "@/services/api";
import { ErrorState, Skeleton } from "@/components/ui/States";

type Tab = "education" | "experience" | "skills" | "resumes" | "interviews";

const TABS: { id: Tab; label: string }[] = [
  { id: "education", label: "Education" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "resumes", label: "Resumes" },
  { id: "interviews", label: "Interviews" },
];

export default function ProfilePage() {
  const [tab, setTab] = useState<Tab>("education");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [education, setEducation] = useState<EducationEntry[]>([]);
  const [experience, setExperience] = useState<ExperienceEntry[]>([]);
  const [skills, setSkills] = useState<SkillEntry[]>([]);
  const [resumes, setResumes] = useState<ResumeEntry[]>([]);
  const [sessions, setSessions] = useState<InterviewSession[]>([]);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [newSkill, setNewSkill] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState(3);
  const [resumeFile, setResumeFile] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [edu, exp, skl, res, ses] = await Promise.all([
        apiClient.listEducation(),
        apiClient.listExperience(),
        apiClient.listSkills(),
        apiClient.listResumes(),
        apiClient.listSessions(),
      ]);
      setEducation(edu);
      setExperience(exp);
      setSkills(skl);
      setResumes(res);
      setSessions(ses);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const startEdit = (id: string, fields: Record<string, string>) => {
    setEditingId(id);
    setDraft(fields);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({});
  };

  async function run(fn: () => Promise<unknown>) {
    try {
      await fn();
      cancelEdit();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed.");
    }
  }

  if (error && !loading)
    return <ErrorState message={error} onRetry={() => void load()} />;

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Manage your profile</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Edit or remove anything you added during onboarding — no wizard needed.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="rounded-pill border border-primary px-5 py-2 text-sm font-bold text-primary"
        >
          Back to dashboard
        </Link>
      </div>

      {/* Tabs */}
      <nav className="mt-8 flex flex-wrap gap-2" aria-label="Profile sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id}
            className={`rounded-pill px-4 py-2 text-sm font-semibold transition ${
              tab === t.id
                ? "bg-primary text-white"
                : "border border-border bg-surface text-ink-secondary hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <section className="mt-6 rounded-card bg-surface p-6 shadow-card sm:p-8">
        {loading ? (
          <>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="mt-4 h-16 w-full" />
          </>
        ) : (
          <>
            {tab === "education" && (
              <ItemList
                emptyLabel="No education entries yet."
                items={education.map((e) => ({
                  id: e.id,
                  title: e.school,
                  subtitle: [e.degree, e.field_of_study].filter(Boolean).join(" · "),
                  meta:
                    e.start_date || e.end_date
                      ? `${e.start_date ?? "?"} — ${e.end_date ?? "present"}`
                      : undefined,
                }))}
                onEdit={(id) => {
                  const e = education.find((x) => x.id === id)!;
                  startEdit(id, {
                    school: e.school,
                    degree: e.degree ?? "",
                    field_of_study: e.field_of_study ?? "",
                    start_date: e.start_date ?? "",
                    end_date: e.end_date ?? "",
                  });
                }}
                onDelete={(id) => void run(() => apiClient.deleteEducation(id))}
                editForm={
                  editingId ? (
                    <EditForm
                      fields={[
                        { name: "school", label: "School", required: true },
                        { name: "degree", label: "Degree" },
                        { name: "field_of_study", label: "Field of study" },
                        { name: "start_date", label: "Start date", type: "date" },
                        { name: "end_date", label: "End date", type: "date" },
                      ]}
                      draft={draft}
                      setDraft={setDraft}
                      onSave={() =>
                        void run(() =>
                          apiClient.addEducation({
                            school: draft.school,
                            degree: draft.degree || null,
                            field_of_study: draft.field_of_study || null,
                            start_date: draft.start_date || null,
                            end_date: draft.end_date || null,
                          }).then(() => apiClient.deleteEducation(editingId))
                        )
                      }
                      onCancel={cancelEdit}
                    />
                  ) : null
                }
              />
            )}

            {tab === "experience" && (
              <ItemList
                emptyLabel="No experience entries yet."
                items={experience.map((e) => ({
                  id: e.id,
                  title: `${e.title} @ ${e.company}`,
                  subtitle: e.description ?? undefined,
                  meta:
                    e.start_date || e.end_date
                      ? `${e.start_date ?? "?"} — ${e.end_date ?? "present"}`
                      : undefined,
                }))}
                onEdit={(id) => {
                  const e = experience.find((x) => x.id === id)!;
                  startEdit(id, {
                    company: e.company,
                    title: e.title,
                    description: e.description ?? "",
                    start_date: e.start_date ?? "",
                    end_date: e.end_date ?? "",
                  });
                }}
                onDelete={(id) => void run(() => apiClient.deleteExperience(id))}
                editForm={
                  editingId ? (
                    <EditForm
                      fields={[
                        { name: "company", label: "Company", required: true },
                        { name: "title", label: "Title", required: true },
                        { name: "description", label: "Description" },
                        { name: "start_date", label: "Start date", type: "date" },
                        { name: "end_date", label: "End date", type: "date" },
                      ]}
                      draft={draft}
                      setDraft={setDraft}
                      onSave={() =>
                        void run(() =>
                          apiClient.addExperience({
                            company: draft.company,
                            title: draft.title,
                            description: draft.description || null,
                            start_date: draft.start_date || null,
                            end_date: draft.end_date || null,
                          }).then(() => apiClient.deleteExperience(editingId))
                        )
                      }
                      onCancel={cancelEdit}
                    />
                  ) : null
                }
              />
            )}

            {tab === "skills" && (
              <div>
                <ul className="space-y-3">
                  {skills.length === 0 && (
                    <li className="text-sm text-ink-secondary">No skills listed yet.</li>
                  )}
                  {skills.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center justify-between rounded-card border border-border p-4"
                    >
                      <div>
                        <span className="font-semibold">{s.name}</span>
                        <span className="ml-3 text-xs text-ink-secondary">
                          Level {s.level}/5
                        </span>
                      </div>
                      <button
                        onClick={() => void run(() => apiClient.deleteSkill(s.id))}
                        className="text-sm font-semibold text-red-400 hover:underline"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
                <form
                  className="mt-4 flex flex-wrap items-end gap-3"
                  onSubmit={(ev) => {
                    ev.preventDefault();
                    if (!newSkill.trim()) return;
                    void run(async () => {
                      await apiClient.addSkill({ name: newSkill.trim(), level: newSkillLevel });
                      setNewSkill("");
                      setNewSkillLevel(3);
                    });
                  }}
                >
                  <input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill…"
                    className="flex-1 rounded-card border border-border bg-background px-4 py-2 text-sm"
                    aria-label="Skill name"
                  />
                  <select
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(Number(e.target.value))}
                    className="rounded-card border border-border bg-background px-3 py-2 text-sm"
                    aria-label="Skill level"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        Level {n}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="rounded-pill bg-primary px-5 py-2 text-sm font-bold text-white"
                  >
                    Add
                  </button>
                </form>
              </div>
            )}

            {tab === "resumes" && (
              <div>
                <ul className="space-y-3">
                  {resumes.length === 0 && (
                    <li className="text-sm text-ink-secondary">
                      No resumes uploaded yet. Resume parsing lands with Phase 4.
                    </li>
                  )}
                  {resumes.map((r) => (
                    <li
                      key={r.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border p-4"
                    >
                      <div>
                        <span className="font-semibold">{r.filename}</span>
                        <span className="ml-3 rounded-pill bg-border/40 px-2 py-0.5 text-xs uppercase tracking-wide text-ink-secondary">
                          {r.status}
                        </span>
                      </div>
                      <button
                        onClick={() => void run(() => apiClient.deleteResume(r.id))}
                        className="text-sm font-semibold text-red-400 hover:underline"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
                <form
                  className="mt-4 flex flex-wrap items-end gap-3"
                  onSubmit={(ev) => {
                    ev.preventDefault();
                    if (!resumeFile.trim()) return;
                    void run(async () => {
                      await apiClient.addResume({ filename: resumeFile.trim() });
                      setResumeFile("");
                    });
                  }}
                >
                  <input
                    value={resumeFile}
                    onChange={(e) => setResumeFile(e.target.value)}
                    placeholder="resume.pdf"
                    className="flex-1 rounded-card border border-border bg-background px-4 py-2 text-sm"
                    aria-label="Resume filename"
                  />
                  <button
                    type="submit"
                    className="rounded-pill bg-primary px-5 py-2 text-sm font-bold text-white"
                  >
                    Register resume
                  </button>
                </form>
              </div>
            )}

            {tab === "interviews" && (
              <ul className="space-y-3">
                {sessions.length === 0 && (
                  <li className="text-sm text-ink-secondary">
                    No interview sessions yet — the live interview experience arrives in Phase 4.
                  </li>
                )}
                {sessions.map((s) => (
                  <li
                    key={s.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border p-4"
                  >
                    <div>
                      <span className="font-semibold">{s.role}</span>
                      <span className="ml-3 text-xs capitalize text-ink-secondary">
                        {s.interview_type} · {s.difficulty} · {s.duration_minutes} min
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="rounded-pill bg-border/40 px-2 py-0.5 text-xs uppercase tracking-wide text-ink-secondary">
                        {s.status.replace("_", " ")}
                      </span>
                      {s.score != null && (
                        <span className="text-sm font-bold text-primary">{s.score}%</span>
                      )}
                      <button
                        onClick={() => void run(() => apiClient.deleteSession(s.id))}
                        className="text-sm font-semibold text-red-400 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
    </main>
  );
}

/* --- Small local components ------------------------------------------- */

function ItemList({
  items,
  emptyLabel,
  onEdit,
  onDelete,
  editForm,
}: {
  items: { id: string; title: string; subtitle?: string; meta?: string }[];
  emptyLabel: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  editForm: React.ReactNode;
}) {
  return (
    <div>
      <ul className="space-y-3">
        {items.length === 0 && <li className="text-sm text-ink-secondary">{emptyLabel}</li>}
        {items.map((item) => (
          <li key={item.id} className="rounded-card border border-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{item.title}</p>
                {item.subtitle && (
                  <p className="text-sm text-ink-secondary">{item.subtitle}</p>
                )}
                {item.meta && <p className="mt-1 text-xs text-ink-secondary">{item.meta}</p>}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => onEdit(item.id)}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="text-sm font-semibold text-red-400 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {editForm}
    </div>
  );
}

function EditForm({
  fields,
  draft,
  setDraft,
  onSave,
  onCancel,
}: {
  fields: { name: string; label: string; required?: boolean; type?: string }[];
  draft: Record<string, string>;
  setDraft: (d: Record<string, string>) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <form
      className="mt-4 grid gap-3 rounded-card border border-primary/40 bg-background/60 p-4 sm:grid-cols-2"
      onSubmit={(ev) => {
        ev.preventDefault();
        onSave();
      }}
    >
      {fields.map((f) => (
        <label key={f.name} className="text-sm">
          <span className="mb-1 block font-semibold text-ink-secondary">{f.label}</span>
          <input
            type={f.type ?? "text"}
            required={f.required}
            value={draft[f.name] ?? ""}
            onChange={(e) => setDraft({ ...draft, [f.name]: e.target.value })}
            className="w-full rounded-card border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
      ))}
      <div className="flex gap-3 sm:col-span-2">
        <button
          type="submit"
          className="rounded-pill bg-primary px-5 py-2 text-sm font-bold text-white"
        >
          Save changes
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-pill border border-border px-5 py-2 text-sm font-semibold text-ink-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
