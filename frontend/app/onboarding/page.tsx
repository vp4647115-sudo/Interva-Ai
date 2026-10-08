"use client";

export const dynamic = "force-dynamic";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import {
  apiClient,
  EducationEntry,
  CertificateEntry,
  ExperienceEntry,
  Preferences,
  SkillEntry,
  WizardState,
} from "@/services/api";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { firebaseAuth } from "@/lib/firebase/auth";
import { searchSkills } from "@/components/resume/SkillPicker";
import TaxonomyInput from "@/components/ui/TaxonomyInput";
import { COMPANY_TAXONOMY, JOB_TITLE_TAXONOMY } from "@/lib/skills/companies";

const STEPS = ["profile", "education", "experience", "skills", "preferences", "certificates"] as const;
type Step = (typeof STEPS)[number];

const STEP_LABELS: Record<Step, string> = {
  profile: "Basic Profile",
  education: "Education",
  experience: "Experience",
  skills: "Skills",
  certificates: "Certificates",
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
  const [certificates, setCertificates] = useState<CertificateEntry[]>([]);
  const [prefs, setPrefs] = useState<Preferences>({
    target_roles: [],
    seniority: null,
    preferred_industries: [],
  });

  // Entry forms
  const [eduForm, setEduForm] = useState({ school: "", degree: "", field_of_study: "" });
  const [expForm, setExpForm] = useState({ company: "", title: "", description: "", years: "" });
  const [skillForm, setSkillForm] = useState({ name: "", level: 3 });
  const [certificateForm, setCertificateForm] = useState({ name: "", cert_id: "", link: "" });
  const [skillListOpen, setSkillListOpen] = useState(false);

  const skillSuggestions = useMemo(
    () =>
      searchSkills(skillForm.name).filter(
        (s) => !skills.some((k) => k.name.toLowerCase() === s.toLowerCase())
      ),
    [skillForm.name, skills]
  );

  // Wait for Firebase to restore the session before calling the API —
  // otherwise the first request fires with no bearer token and 401s.
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(firebaseAuth, (user) => {
      setAuthUser(user);
      setAuthReady(true);
    });
  }, []);

  const load = useCallback(async () => {
    if (!authUser) return;
    try {
      const wizard = await apiClient.getWizardState();
      setState(wizard);
      const [profile, edu, exp, skl, certs, prf] = await Promise.all([
        apiClient.getProfile(),
        apiClient.listEducation(),
        apiClient.listExperience(),
        apiClient.listSkills(),
        apiClient.listCertificates(),
        apiClient.getPreferences(),
      ]);
      setFullName(profile.full_name ?? "");
      setHeadline(profile.bio ?? profile.target_role ?? "");
      setEducation(edu);
      setExperience(exp);
      setSkills(skl);
      setCertificates(certs);
      setPrefs(prf);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load onboarding.");
    }
  }, [authUser]);

  useEffect(() => {
    if (authReady && authUser) void load();
  }, [authReady, authUser, load]);

  // Signed out (or session not restored) — send to login instead of 401-ing.
  useEffect(() => {
    if (authReady && !authUser) router.replace("/auth/login");
  }, [authReady, authUser, router]);

  // Onboarding is one-time only: a user who already finished the wizard
  // (e.g. bookmarked /onboarding) goes straight to their dashboard.
  useEffect(() => {
    if (state?.finished) router.replace("/dashboard");
  }, [state, router]);

  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!authReady || !authUser || !state) {
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

  async function saveBasicProfile() {
    setSaving(true);
    setError(null);
    try {
      await apiClient.updateProfile({
        full_name: fullName.trim() || null,
        bio: headline.trim() || null,
      });
      markDone("profile");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save profile.");
      setSaving(false);
    }
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
            <button onClick={() => void saveBasicProfile()} disabled={saving}
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
                  <span className="text-sm">
                    <strong>{e.title}</strong> at {e.company}
                    {e.years != null && (
                      <span className="ml-2 rounded-pill bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary">
                        {e.years} {e.years === 1 ? "yr" : "yrs"}
                      </span>
                    )}
                    {e.description && <span className="block text-xs text-ink-secondary">{e.description}</span>}
                  </span>
                  <button className="text-sm font-semibold text-error"
                    onClick={() => void apiClient.deleteExperience(e.id).then(load)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <TaxonomyInput
                id="expCompany"
                className={inputCls}
                placeholder="Company — try “goo”, “ama”…"
                ariaLabel="Company"
                value={expForm.company}
                options={COMPANY_TAXONOMY}
                onChange={(company) => setExpForm({ ...expForm, company })}
              />
              <TaxonomyInput
                id="expTitle"
                className={inputCls}
                placeholder="Job title — try “soft”, “data”…"
                ariaLabel="Job title"
                value={expForm.title}
                options={JOB_TITLE_TAXONOMY}
                onChange={(title) => setExpForm({ ...expForm, title })}
              />
              <div>
                <input
                  className={inputCls}
                  placeholder="Years worked (e.g. 2)"
                  aria-label="Years worked"
                  inputMode="numeric"
                  value={expForm.years}
                  onChange={(e) => setExpForm({ ...expForm, years: e.target.value.replace(/[^0-9.]/g, "") })}
                />
              </div>
              <textarea className={`${inputCls} sm:col-span-2`} rows={2} placeholder="What did you do there?"
                value={expForm.description}
                onChange={(e) => setExpForm({ ...expForm, description: e.target.value })} />
            </div>
            <div className="mt-4 flex gap-3">
              <button
                disabled={!expForm.company || !expForm.title || saving}
                onClick={() =>
                  void apiClient
                    .addExperience({
                      company: expForm.company,
                      title: expForm.title,
                      description: expForm.description || null,
                      start_date: null,
                      end_date: null,
                      years: expForm.years === "" ? null : Number(expForm.years),
                    })
                    .then(() => { setExpForm({ company: "", title: "", description: "", years: "" }); return load(); })
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
              <div className="relative">
                <label className={labelCls} htmlFor="skillName">Skill</label>
                <input
                  id="skillName"
                  className={inputCls}
                  placeholder="e.g. Python"
                  value={skillForm.name}
                  autoComplete="off"
                  role="combobox"
                  aria-expanded={skillListOpen && skillSuggestions.length > 0}
                  aria-controls="skill-suggestions"
                  onChange={(e) => { setSkillForm({ ...skillForm, name: e.target.value }); setSkillListOpen(true); }}
                  onFocus={() => setSkillListOpen(true)}
                  onBlur={() => setTimeout(() => setSkillListOpen(false), 150)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && skillSuggestions.length > 0) {
                      e.preventDefault();
                      setSkillForm({ ...skillForm, name: skillSuggestions[0] });
                      setSkillListOpen(false);
                    }
                  }}
                />
                {skillListOpen && skillForm.name.trim() !== "" && skillSuggestions.length > 0 && (
                  <ul
                    id="skill-suggestions"
                    role="listbox"
                    className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-border bg-white shadow-card"
                  >
                    {skillSuggestions.map((s) => (
                      <li key={s} role="option" aria-selected={false}>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => { setSkillForm({ ...skillForm, name: s }); setSkillListOpen(false); }}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-primary-soft"
                        >
                          {s}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
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

        {currentStep === "certificates" && (
          <div>
            <h2 className="text-xl font-bold">Certificates</h2>
            <p className="mt-1 text-sm text-ink-secondary">Add relevant certificates now, or skip this optional step.</p>
            <ul className="mt-4 space-y-2">
              {certificates.map((certificate) => (
                <li key={certificate.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
                  <span className="text-sm"><strong>{certificate.name}</strong>{certificate.cert_id && <> — {certificate.cert_id}</>}</span>
                  <button className="text-sm font-semibold text-error" onClick={() => void apiClient.deleteCertificate(certificate.id).then(load)}>Remove</button>
                </li>
              ))}
            </ul>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <input className={inputCls} placeholder="Certificate name" value={certificateForm.name} onChange={(e) => setCertificateForm({ ...certificateForm, name: e.target.value })} />
              <input className={inputCls} placeholder="Certificate ID (optional)" value={certificateForm.cert_id} onChange={(e) => setCertificateForm({ ...certificateForm, cert_id: e.target.value })} />
              <input className={inputCls} type="url" placeholder="Certificate link (optional)" value={certificateForm.link} onChange={(e) => setCertificateForm({ ...certificateForm, link: e.target.value })} />
            </div>
            <div className="mt-4 flex gap-3">
              <button disabled={!certificateForm.name.trim() || saving} onClick={() => void apiClient.addCertificate({ name: certificateForm.name.trim(), cert_id: certificateForm.cert_id.trim() || null, link: certificateForm.link.trim() || null }).then(() => { setCertificateForm({ name: "", cert_id: "", link: "" }); return load(); })} className="rounded-pill border border-primary px-5 py-2 text-sm font-bold text-primary disabled:opacity-40">Add Certificate</button>
              <button onClick={() => markDone("certificates")} disabled={saving} className="rounded-pill bg-primary px-6 py-2 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-50">Save &amp; continue</button>
            </div>
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
