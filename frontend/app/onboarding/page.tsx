"use client";

export const dynamic = "force-dynamic";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  apiClient,
  EducationEntry,
  ExperienceEntry,
  Preferences,
  SkillEntry,
  WizardState,
} from "@/services/api";
import { ErrorState, Skeleton } from "@/components/ui/States";

const STEPS = ["profile", "education", "experience", "skills", "preferences"] as const;
type Step = (typeof STEPS)[number];

const STEP_LABELS: Record<Step, string> = {
  profile: "Basic Profile",
  education: "Education",
  experience: "Experience",
  skills: "Skills",
  preferences: "Career Preferences",
};

const inputCls =
  "w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";
const labelCls = "mb-1.5 block text-sm font-semibold text-ink-primary";

export default function OnboardingPage() {
  const router = useRouter();
  const [state, setState] = useState<WizardState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Step-local data
  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [education, setEducation] = useState<EducationEntry[]>([]);
  const [experience, setExperience] = useState<ExperienceEntry[]>([]);
  const [skills, setSkills] = useState<SkillEntry[]>([]);
  const [prefs, setPrefs] = useState<Preferences>({
    target_roles: [],
    seniority: null,
    preferred_industries: [],
  });

  // Entry forms
  const [eduForm, setEduForm] = useState({ school: "", degree: "", field_of_study: "" });
  const [expForm, setExpForm] = useState({ company: "", title: "", description: "" });
  const [skillForm, setSkillForm] = useState({ name: "", level: 3 });

  const load = useCallback(async () => {
    try {
      const wizard = await apiClient.getWizardState();
      setState(wizard);
      const [edu, exp, skl, prf] = await Promise.all([
        apiClient.listEducation(),
        apiClient.listExperience(),
        apiClient.listSkills(),
        apiClient.getPreferences(),
      ]);
      setEducation(edu);
      setExperience(exp);
      setSkills(skl);
      setPrefs(prf);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load onboarding.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!state) {
    return (
      <main className="mx-auto max-w-3xl p-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-6 h-64 w-full" />
      </main>
    );
  }

  const stepIndex = Math.min(
    Math.max(state.current_step, 0),
    STEPS.length - 1
  );
  const currentStep = STEPS[stepIndex];

  async function persist(next: WizardState) {
    setSaving(true);
    setError(null);
    try {
      setState(await apiClient.saveWizardState(next));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save progress.");
    } finally {
      setSaving(false);
    }
  }

  function markDone(step: Step) {
    const completed = Array.from(new Set([...state!.completed_steps, step]));
    const nextIdx = Math.min(STEPS.indexOf(step) + 1, STEPS.length - 1);
    void persist({
      completed_steps: completed,
      current_step: nextIdx,
      finished: state!.finished,
    });
  }

  function goTo(step: Step) {
    void persist({
      completed_steps: state!.completed_steps,
      current_step: STEPS.indexOf(step),
      finished: state!.finished,
    });
  }

  async function finish() {
    setSaving(true);
    try {
      await apiClient.finishOnboarding();
      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to finish.");
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-extrabold">Build your profile</h1>
      <p className="mt-2 text-sm text-ink-secondary">
        Your progress is saved automatically — you can leave and resume anytime.
      </p>

      {/* Stepper */}
      <ol className="mt-8 flex flex-wrap gap-2">
        {STEPS.map((s, i) => (
          <li key={s}>
            <button
              onClick={() => goTo(s)}
              className={`rounded-pill px-4 py-1.5 text-sm font-semibold transition ${
                s === currentStep
                  ? "bg-primary text-white"
                  : state.completed_steps.includes(s)
                    ? "bg-primary-soft text-primary"
                    : "bg-surface text-ink-secondary"
              }`}
            >
              {i + 1}. {STEP_LABELS[s]}
            </button>
          </li>
        ))}
      </ol>

      <section className="mt-8 rounded-card bg-surface p-8 shadow-card">
        {currentStep === "profile" && (
          <div>
            <h2 className="text-xl font-bold">{STEP_LABELS.profile}</h2>
            <div className="mt-5 space-y-4">
              <div>
                <label className={labelCls} htmlFor="fullName">Full name</label>
                <input id="fullName" className={inputCls} value={fullName}
                  onChange={(e) => setFullName(e.target.value)} placeholder="Ada Lovelace" />
              </div>
              <div>
                <label className={labelCls} htmlFor="headline">Headline</label>
                <input id="headline" className={inputCls} value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Backend engineer passionate about distributed systems" />
              </div>
            </div>
            <button onClick={() => markDone("profile")} disabled={saving}
              className="mt-6 rounded-pill bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-50">
              Save &amp; continue
            </button>
          </div>
        )}

        {currentStep === "education" && (
          <div>
            <h2 className="text-xl font-bold">{STEP_LABELS.education}</h2>
            <ul className="mt-4 space-y-2">
              {education.map((e) => (
                <li key={e.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                  <span className="text-sm">
                    <strong>{e.school}</strong>
                    {e.degree && <> — {e.degree}</>}
                    {e.field_of_study && <>, {e.field_of_study}</>}
                  </span>
                  <button className="text-sm font-semibold text-error"
                    onClick={() => void apiClient.deleteEducation(e.id).then(load)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <input className={inputCls} placeholder="School" value={eduForm.school}
                onChange={(e) => setEduForm({ ...eduForm, school: e.target.value })} />
              <input className={inputCls} placeholder="Degree" value={eduForm.degree}
                onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })} />
              <input className={inputCls} placeholder="Field of study" value={eduForm.field_of_study}
                onChange={(e) => setEduForm({ ...eduForm, field_of_study: e.target.value })} />
            </div>
            <div className="mt-4 flex gap-3">
              <button
                disabled={!eduForm.school || saving}
                onClick={() =>
                  void apiClient
                    .addEducation({ school: eduForm.school, degree: eduForm.degree || null, field_of_study: eduForm.field_of_study || null, start_date: null, end_date: null })
                    .then(() => { setEduForm({ school: "", degree: "", field_of_study: "" }); return load(); })
                }
                className="rounded-pill border border-primary px-5 py-2 text-sm font-bold text-primary disabled:opacity-40">
                Add education
              </button>
              <button onClick={() => markDone("education")} disabled={saving}
                className="rounded-pill bg-primary px-6 py-2 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-50">
                Save &amp; continue
              </button>
            </div>
          </div>
        )}

        {currentStep === "experience" && (
          <div>
            <h2 className="text-xl font-bold">{STEP_LABELS.experience}</h2>
            <ul className="mt-4 space-y-2">
              {experience.map((e) => (
                <li key={e.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                  <span className="text-sm"><strong>{e.title}</strong> at {e.company}</span>
                  <button className="text-sm font-semibold text-error"
                    onClick={() => void apiClient.deleteExperience(e.id).then(load)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input className={inputCls} placeholder="Company" value={expForm.company}
                onChange={(e) => setExpForm({ ...expForm, company: e.target.value })} />
              <input className={inputCls} placeholder="Job title" value={expForm.title}
                onChange={(e) => setExpForm({ ...expForm, title: e.target.value })} />
              <textarea className={`${inputCls} sm:col-span-2`} rows={2} placeholder="What did you do?"
                value={expForm.description}
                onChange={(e) => setExpForm({ ...expForm, description: e.target.value })} />
            </div>
            <div className="mt-4 flex gap-3">
              <button
                disabled={!expForm.company || !expForm.title || saving}
                onClick={() =>
                  void apiClient
                    .addExperience({ company: expForm.company, title: expForm.title, description: expForm.description || null, start_date: null, end_date: null })
                    .then(() => { setExpForm({ company: "", title: "", description: "" }); return load(); })
                }
                className="rounded-pill border border-primary px-5 py-2 text-sm font-bold text-primary disabled:opacity-40">
                Add experience
              </button>
              <button onClick={() => markDone("experience")} disabled={saving}
                className="rounded-pill bg-primary px-6 py-2 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-50">
                Save &amp; continue
              </button>
            </div>
          </div>
        )}

        {currentStep === "skills" && (
          <div>
            <h2 className="text-xl font-bold">{STEP_LABELS.skills}</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {skills.map((s) => (
                <li key={s.id}
                  className="flex items-center gap-2 rounded-pill bg-primary-soft px-4 py-1.5 text-sm font-semibold text-primary">
                  {s.name} · L{s.level}
                  <button aria-label={`Remove ${s.name}`} className="font-bold"
                    onClick={() => void apiClient.deleteSkill(s.id).then(load)}>×</button>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <div>
                <label className={labelCls} htmlFor="skillName">Skill</label>
                <input id="skillName" className={inputCls} placeholder="e.g. Python" value={skillForm.name}
                  onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })} />
              </div>
              <div>
                <label className={labelCls} htmlFor="skillLevel">Level (1–5)</label>
                <select id="skillLevel" className={inputCls} value={skillForm.level}
                  onChange={(e) => setSkillForm({ ...skillForm, level: Number(e.target.value) })}>
                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <button
                disabled={!skillForm.name || saving}
                onClick={() =>
                  void apiClient
                    .addSkill({ name: skillForm.name, level: skillForm.level })
                    .then(() => { setSkillForm({ name: "", level: 3 }); return load(); })
                }
                className="rounded-pill border border-primary px-5 py-2.5 text-sm font-bold text-primary disabled:opacity-40">
                Add skill
              </button>
            </div>
            <button onClick={() => markDone("skills")} disabled={saving}
              className="mt-6 rounded-pill bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-50">
              Save &amp; continue
            </button>
          </div>
        )}

        {currentStep === "preferences" && (
          <div>
            <h2 className="text-xl font-bold">{STEP_LABELS.preferences}</h2>
            <div className="mt-5 space-y-4">
              <div>
                <label className={labelCls} htmlFor="roles">Target roles (comma-separated)</label>
                <input id="roles" className={inputCls}
                  value={prefs.target_roles.join(", ")}
                  onChange={(e) => setPrefs({ ...prefs, target_roles: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                  placeholder="Backend Engineer, Full-stack Developer" />
              </div>
              <div>
                <label className={labelCls} htmlFor="seniority">Seniority</label>
                <select id="seniority" className={inputCls} value={prefs.seniority ?? ""}
                  onChange={(e) => setPrefs({ ...prefs, seniority: e.target.value || null })}>
                  <option value="">Select…</option>
                  {["Intern", "Junior", "Mid", "Senior", "Staff", "Lead"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="industries">Preferred industries</label>
                <input id="industries" className={inputCls}
                  value={prefs.preferred_industries.join(", ")}
                  onChange={(e) => setPrefs({ ...prefs, preferred_industries: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                  placeholder="Fintech, AI" />
              </div>
            </div>
            <button
              disabled={saving}
              onClick={() => void apiClient.savePreferences(prefs).then(() => markDone("preferences"))}
              className="mt-6 rounded-pill bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-50">
              Save preferences
            </button>
          </div>
        )}
      </section>

      <div className="mt-8 flex justify-between">
        <button
          disabled={stepIndex === 0 || saving}
          onClick={() => goTo(STEPS[stepIndex - 1])}
          className="rounded-pill border border-border px-6 py-2.5 text-sm font-semibold text-ink-secondary disabled:opacity-40">
          Back
        </button>
        <button
          disabled={saving}
          onClick={() => void finish()}
          className="rounded-pill bg-gradient-to-r from-primary to-secondary px-8 py-2.5 text-sm font-bold text-white shadow-card disabled:opacity-50">
          Finish → Go to dashboard
        </button>
      </div>
    </main>
  );
}
