"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  apiClient,
  EducationEntry,
  CertificateEntry,
  ExperienceEntry,
  InterviewSession,
  ProfileIn,
  ProfileOut,
  ResumeEntry,
  SkillEntry,
} from "@/services/api";
import { ErrorState, Skeleton } from "@/components/ui/States";
import RequireOnboarding from "@/components/auth/RequireOnboarding";
import Sidebar from "@/components/dashboard/Sidebar";

type Tab =
  | "overview"
  | "education"
  | "experience"
  | "certificates"
  | "skills"
  | "interviews"
  | "mock-interviews"
  | "upcoming"
  | "resources";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "👤" },
  { id: "education", label: "Education", icon: "🎓" },
  { id: "experience", label: "Experience", icon: "💼" },
  { id: "certificates", label: "Certificates", icon: "🏆" },
  { id: "skills", label: "Skills", icon: "⚡" },
  { id: "interviews", label: "Interviews", icon: "🎤" },
  { id: "mock-interviews", label: "Mock Interviews", icon: "🎭" },
  { id: "upcoming", label: "Upcoming", icon: "📅" },
  { id: "resources", label: "Resources", icon: "📂" },
];

export default function ProfilePage() {
  return (
    <RequireOnboarding>
      <ProfileContent />
    </RequireOnboarding>
  );
}

function ProfileContent() {
  const [tab, setTab] = useState<Tab>("overview");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<ProfileOut | null>(null);
  const [education, setEducation] = useState<EducationEntry[]>([]);
  const [experience, setExperience] = useState<ExperienceEntry[]>([]);
  const [certificates, setCertificates] = useState<CertificateEntry[]>([]);
  const [skills, setSkills] = useState<SkillEntry[]>([]);
  const [resumes, setResumes] = useState<ResumeEntry[]>([]);
  const [sessions, setSessions] = useState<InterviewSession[]>([]);

  // Edit state for data tabs
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [newSkill, setNewSkill] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState(3);
  const [resumeFile, setResumeFile] = useState("");

  // Profile edit state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState<ProfileIn>({});
  const [savingProfile, setSavingProfile] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [prof, edu, exp, certs, skl, res, ses] = await Promise.all([
        apiClient.getProfile(),
        apiClient.listEducation(),
        apiClient.listExperience(),
        apiClient.listCertificates(),
        apiClient.listSkills(),
        apiClient.listResumes(),
        apiClient.listSessions(),
      ]);
      setProfile(prof);
      setEducation(edu);
      setExperience(exp);
      setCertificates(certs);
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

  async function saveProfile() {
    try {
      setSavingProfile(true);
      const updated = await apiClient.updateProfile(profileDraft);
      setProfile(updated);
      setEditingProfile(false);
      setProfileDraft({});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  // Derived session buckets
  const completedSessions = sessions.filter((s) => s.status === "completed");
  const upcomingSessions = sessions.filter(
    (s) => s.status === "draft" || s.status === "in_progress"
  );

  if (error && !loading)
    return <ErrorState message={error} onRetry={() => void load()} />;

  const displayName = profile?.full_name || "Your Name";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden shrink-0 md:block"><Sidebar /></div>
      <main className="min-w-0 flex-1 bg-background">
      {/* ── Hero / Profile Header ─────────────────────────────── */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #6366f1 0%, #8b5cf6 40%, #ec4899 100%)",
        }}
        className="relative overflow-hidden"
      >
        {/* Decorative circles */}
        <div
          className="absolute -top-16 -right-16 h-64 w-64 rounded-full opacity-20"
          style={{ background: "rgba(255,255,255,0.15)" }}
        />
        <div
          className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full opacity-20"
          style={{ background: "rgba(255,255,255,0.1)" }}
        />

        <div className="relative mx-auto max-w-6xl px-6 pb-8 pt-10">
          {/* Back link */}
          <Link
            href="/dashboard"
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/30"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Dashboard
          </Link>

          <div className="flex flex-wrap items-end gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white/25 text-3xl font-extrabold text-white shadow-lg backdrop-blur-sm ring-4 ring-white/30">
                {loading ? "…" : initials}
              </div>
              {/* Online indicator */}
              <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white bg-emerald-400" />
            </div>

            {/* Name & meta */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="h-8 w-48 animate-pulse rounded-lg bg-white/20" />
              ) : (
                <h1 className="truncate text-3xl font-extrabold text-white">
                  {displayName}
                </h1>
              )}
              {loading ? (
                <div className="mt-2 h-4 w-64 animate-pulse rounded bg-white/20" />
              ) : (
                <p className="mt-1 text-sm text-white/80">
                  {profile?.target_role && (
                    <span className="mr-2 inline-flex items-center gap-1">
                      💼 {profile.target_role}
                    </span>
                  )}
                  {profile?.location && (
                    <span className="mr-2 inline-flex items-center gap-1">
                      📍 {profile.location}
                    </span>
                  )}
                  {profile?.email && (
                    <span className="inline-flex items-center gap-1">
                      ✉️ {profile.email}
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Subscription badge */}
            {!loading && profile && (
              <div className="rounded-2xl bg-white/20 px-5 py-3 backdrop-blur-sm text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                  Plan
                </p>
                <p className="mt-0.5 text-sm font-extrabold text-white">
                  {profile.subscription_plan}
                </p>
                <span className="mt-1 inline-block rounded-full bg-emerald-400/30 px-2 py-0.5 text-[10px] font-bold text-emerald-100">
                  {profile.subscription_status}
                </span>
              </div>
            )}
          </div>

          {/* ── Stats bar ──────────────────────────────── */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                label: "Interviews Conducted",
                value: profile?.interviews_conducted ?? 0,
                icon: "🎤",
              },
              {
                label: "Mock Interviews",
                value: profile?.mock_interviews_count ?? 0,
                icon: "🎭",
              },
              {
                label: "Upcoming",
                value: profile?.upcoming_interviews_count ?? 0,
                icon: "📅",
              },
              {
                label: "Resources",
                value: profile?.resources_count ?? 0,
                icon: "📂",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm text-white"
              >
                <p className="text-xl">{stat.icon}</p>
                {loading ? (
                  <div className="mt-1 h-7 w-12 animate-pulse rounded bg-white/20" />
                ) : (
                  <p className="mt-1 text-2xl font-extrabold">{stat.value}</p>
                )}
                <p className="text-[11px] font-semibold text-white/70">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────── */}
      <div className="sticky top-0 z-10 border-b border-border bg-surface shadow-sm">
        <div className="mx-auto max-w-6xl px-6">
          <nav
            className="flex gap-1 overflow-x-auto py-2"
            aria-label="Profile sections"
            style={{ scrollbarWidth: "none" }}
          >
            {TABS.map((t) => (
              <button
                key={t.id}
                id={`tab-${t.id}`}
                onClick={() => setTab(t.id)}
                aria-current={tab === t.id ? "page" : undefined}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                  tab === t.id
                    ? "bg-primary text-white shadow-sm"
                    : "text-ink-secondary hover:bg-surface-alt hover:text-ink-primary"
                }`}
              >
                <span>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Tab Content ──────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-6 py-8">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <>
            {/* ── OVERVIEW TAB ── */}
            {tab === "overview" && (
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Personal Info Card */}
                <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold">Personal Information</h2>
                    {!editingProfile ? (
                      <button
                        id="edit-profile-btn"
                        onClick={() => {
                          setProfileDraft({
                            full_name: profile?.full_name ?? "",
                            phone: profile?.phone ?? "",
                            location: profile?.location ?? "",
                            birth_date: profile?.birth_date ?? "",
                            target_role: profile?.target_role ?? "",
                            bio: profile?.bio ?? "",
                          });
                          setEditingProfile(true);
                        }}
                        className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary transition hover:bg-primary/20"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          id="save-profile-btn"
                          onClick={() => void saveProfile()}
                          disabled={savingProfile}
                          className="rounded-xl bg-primary px-3 py-1.5 text-sm font-bold text-white disabled:opacity-60"
                        >
                          {savingProfile ? "Saving…" : "Save"}
                        </button>
                        <button
                          onClick={() => setEditingProfile(false)}
                          className="rounded-xl border border-border px-3 py-1.5 text-sm font-semibold text-ink-secondary hover:bg-surface-alt"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {editingProfile ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {(
                        [
                          { key: "full_name", label: "Full Name", type: "text" },
                          { key: "phone", label: "Phone", type: "tel" },
                          { key: "location", label: "Location", type: "text" },
                          { key: "birth_date", label: "Birth Date", type: "date" },
                          { key: "target_role", label: "Target Role", type: "text" },
                        ] as { key: keyof ProfileIn; label: string; type: string }[]
                      ).map((f) => (
                        <label key={f.key} className="text-sm">
                          <span className="mb-1 block font-semibold text-ink-secondary">
                            {f.label}
                          </span>
                          <input
                            id={`profile-field-${f.key}`}
                            type={f.type}
                            value={(profileDraft[f.key] as string) ?? ""}
                            onChange={(e) =>
                              setProfileDraft({ ...profileDraft, [f.key]: e.target.value })
                            }
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                          />
                        </label>
                      ))}
                      <label className="text-sm sm:col-span-2">
                        <span className="mb-1 block font-semibold text-ink-secondary">Bio</span>
                        <textarea
                          id="profile-field-bio"
                          rows={3}
                          value={(profileDraft.bio as string) ?? ""}
                          onChange={(e) =>
                            setProfileDraft({ ...profileDraft, bio: e.target.value })
                          }
                          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                          placeholder="Tell us about yourself…"
                        />
                      </label>
                    </div>
                  ) : (
                    <dl className="space-y-3">
                      {[
                        { label: "Full Name", value: profile?.full_name, icon: "👤" },
                        { label: "Email", value: profile?.email, icon: "✉️" },
                        { label: "Phone", value: profile?.phone, icon: "📞" },
                        { label: "Location", value: profile?.location, icon: "📍" },
                        { label: "Birth Date", value: profile?.birth_date, icon: "🎂" },
                        { label: "Target Role", value: profile?.target_role, icon: "🎯" },
                      ].map((item) => (
                        <div key={item.label} className="flex items-start gap-3">
                          <span className="mt-0.5 text-base">{item.icon}</span>
                          <div className="min-w-0 flex-1">
                            <dt className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                              {item.label}
                            </dt>
                            <dd className="mt-0.5 text-sm text-ink-primary">
                              {item.value || (
                                <span className="italic text-ink-muted">Not set</span>
                              )}
                            </dd>
                          </div>
                        </div>
                      ))}
                      {profile?.bio && (
                        <div className="pt-2 border-t border-border">
                          <dt className="text-xs font-bold uppercase tracking-wide text-ink-muted mb-1">
                            Bio
                          </dt>
                          <dd className="text-sm text-ink-primary leading-relaxed">
                            {profile.bio}
                          </dd>
                        </div>
                      )}
                    </dl>
                  )}
                </div>

                {/* Subscription & Quick Stats */}
                <div className="space-y-5">
                  {/* Subscription card */}
                  <div
                    className="rounded-2xl p-6 text-white"
                    style={{
                      background:
                        "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-white/70">
                          Subscription Plan
                        </p>
                        <p className="mt-1 text-xl font-extrabold">
                          {profile?.subscription_plan}
                        </p>
                        <span className="mt-2 inline-block rounded-full bg-emerald-400/30 px-3 py-1 text-xs font-bold text-emerald-100">
                          ● {profile?.subscription_status}
                        </span>
                      </div>
                      <div className="text-5xl opacity-30">⭐</div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/20 pt-4">
                      <div>
                        <p className="text-xl font-extrabold">
                          {profile?.interviews_conducted}
                        </p>
                        <p className="text-xs text-white/70">Interviews Done</p>
                      </div>
                      <div>
                        <p className="text-xl font-extrabold">
                          {profile?.mock_interviews_count}
                        </p>
                        <p className="text-xs text-white/70">Mock Sessions</p>
                      </div>
                    </div>
                  </div>

                  {/* Activity summary */}
                  <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                    <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-ink-muted">
                      Activity Summary
                    </h3>
                    <ul className="space-y-3">
                      {[
                        {
                          label: "Education entries",
                          value: education.length,
                          color: "bg-blue-500",
                        },
                        {
                          label: "Experience entries",
                          value: experience.length,
                          color: "bg-purple-500",
                        },
                        {
                          label: "Skills listed",
                          value: skills.length,
                          color: "bg-emerald-500",
                        },
                        {
                          label: "Resumes uploaded",
                          value: resumes.length,
                          color: "bg-orange-500",
                        },
                      ].map((item) => (
                        <li key={item.label} className="flex items-center gap-3">
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${item.color}`}
                          />
                          <span className="flex-1 text-sm text-ink-secondary">
                            {item.label}
                          </span>
                          <span className="text-sm font-bold text-ink-primary">
                            {item.value}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* ── EDUCATION TAB ── */}
            {tab === "education" && (
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-bold">Education History</h2>
                  <button
                    onClick={() => startEdit("new-education", { school: "", degree: "", field_of_study: "", start_date: "", end_date: "" })}
                    className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90"
                  >
                    Add Education
                  </button>
                </div>
                <ItemList
                  emptyLabel="No education entries yet."
                  items={education.map((e) => ({
                    id: e.id,
                    title: e.school,
                    subtitle: [e.degree, e.field_of_study]
                      .filter(Boolean)
                      .join(" · "),
                    meta:
                      e.start_date || e.end_date
                        ? `${e.start_date ?? "?"} — ${e.end_date ?? "present"}`
                        : undefined,
                    badge: e.degree ?? undefined,
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
                  onDelete={(id) =>
                    void run(() => apiClient.deleteEducation(id))
                  }
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
                              }).then(() => editingId === "new-education" ? undefined : apiClient.deleteEducation(editingId))
                          )
                        }
                        onCancel={cancelEdit}
                      />
                    ) : null
                  }
                />
              </div>
            )}

            {/* ── EXPERIENCE TAB ── */}
            {tab === "experience" && (
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-bold">Work Experience</h2>
                  <button
                    onClick={() => startEdit("new-experience", { company: "", title: "", description: "", start_date: "", end_date: "" })}
                    className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90"
                  >
                    Add Experience
                  </button>
                </div>
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
                  onDelete={(id) =>
                    void run(() => apiClient.deleteExperience(id))
                  }
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
                                years: null,
                                start_date: draft.start_date || null,
                                end_date: draft.end_date || null,
                              }).then(() => editingId === "new-experience" ? undefined : apiClient.deleteExperience(editingId))
                          )
                        }
                        onCancel={cancelEdit}
                      />
                    ) : null
                  }
                />
              </div>
            )}

            {/* ── CERTIFICATES TAB ── */}
            {tab === "certificates" && (
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-bold">Certificates</h2>
                  <button
                    onClick={() => startEdit("new-certificate", { name: "", link: "", cert_id: "" })}
                    className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90"
                  >
                    Add Certificate
                  </button>
                </div>
                <ItemList
                  emptyLabel="No certificates added yet."
                  items={certificates.map((c) => ({ id: c.id, title: c.name, subtitle: c.cert_id ? `Certificate ID: ${c.cert_id}` : undefined, meta: c.link ?? undefined }))}
                  onEdit={(id) => {
                    const c = certificates.find((x) => x.id === id)!;
                    startEdit(id, { name: c.name, link: c.link ?? "", cert_id: c.cert_id ?? "" });
                  }}
                  onDelete={(id) => void run(() => apiClient.deleteCertificate(id))}
                  editForm={editingId ? (
                    <EditForm
                      fields={[{ name: "name", label: "Certificate name", required: true }, { name: "cert_id", label: "Certificate ID" }, { name: "link", label: "Certificate link", type: "url" }]}
                      draft={draft}
                      setDraft={setDraft}
                      onSave={() => void run(() => apiClient.addCertificate({ name: draft.name, cert_id: draft.cert_id || null, link: draft.link || null }).then(() => editingId === "new-certificate" ? undefined : apiClient.deleteCertificate(editingId)))}
                      onCancel={cancelEdit}
                    />
                  ) : null}
                />
              </div>
            )}

            {/* ── SKILLS TAB ── */}
            {tab === "skills" && (
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                <h2 className="mb-5 text-lg font-bold">Skills</h2>
                {skills.length === 0 && (
                  <p className="mb-4 text-sm text-ink-secondary">
                    No skills listed yet.
                  </p>
                )}
                <div className="mb-6 flex flex-wrap gap-3">
                  {skills.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2"
                    >
                      <span className="font-semibold text-sm">{s.name}</span>
                      <span className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <span
                            key={n}
                            className={`h-1.5 w-1.5 rounded-full ${
                              n <= s.level ? "bg-primary" : "bg-border"
                            }`}
                          />
                        ))}
                      </span>
                      <span className="text-xs text-ink-muted">L{s.level}</span>
                      <button
                        id={`remove-skill-${s.id}`}
                        onClick={() =>
                          void run(() => apiClient.deleteSkill(s.id))
                        }
                        className="ml-1 text-red-400 hover:text-red-500"
                        aria-label={`Remove ${s.name}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <form
                  id="add-skill-form"
                  className="flex flex-wrap items-end gap-3"
                  onSubmit={(ev) => {
                    ev.preventDefault();
                    if (!newSkill.trim()) return;
                    void run(async () => {
                      await apiClient.addSkill({
                        name: newSkill.trim(),
                        level: newSkillLevel,
                      });
                      setNewSkill("");
                      setNewSkillLevel(3);
                    });
                  }}
                >
                  <input
                    id="new-skill-name"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill…"
                    className="flex-1 rounded-xl border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none"
                    aria-label="Skill name"
                  />
                  <select
                    id="new-skill-level"
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(Number(e.target.value))}
                    className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
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
                    className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white hover:bg-primary/90"
                  >
                    Add Skill
                  </button>
                </form>
              </div>
            )}

            {/* ── INTERVIEWS TAB ── */}
            {tab === "interviews" && (
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-lg font-bold">
                    Interviews Conducted
                    <span className="ml-2 rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-bold text-primary">
                      {completedSessions.length}
                    </span>
                  </h2>
                  <Link href="/mock-interviews" className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90">
                    Schedule Interview
                  </Link>
                </div>
                {completedSessions.length === 0 ? (
                  <EmptyState
                    icon="🎤"
                    title="No completed interviews yet"
                    description="Your completed interview sessions will appear here."
                  />
                ) : (
                  <ul className="space-y-3">
                    {completedSessions.map((s) => (
                      <SessionCard key={s.id} session={s} onDelete={(id) => void run(() => apiClient.deleteSession(id))} />
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* ── MOCK INTERVIEWS TAB ── */}
            {tab === "mock-interviews" && (
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-lg font-bold">
                    Mock Interviews
                    <span className="ml-2 rounded-full bg-purple-100 px-2.5 py-0.5 text-sm font-bold text-purple-600">
                      {sessions.length}
                    </span>
                  </h2>
                </div>
                {sessions.length === 0 ? (
                  <EmptyState
                    icon="🎭"
                    title="No mock interviews yet"
                    description="Start a mock interview to practice for your next big opportunity."
                  />
                ) : (
                  <ul className="space-y-3">
                    {sessions.map((s) => (
                      <SessionCard key={s.id} session={s} onDelete={(id) => void run(() => apiClient.deleteSession(id))} />
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* ── UPCOMING TAB ── */}
            {tab === "upcoming" && (
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-lg font-bold">
                    Upcoming Interviews
                    <span className="ml-2 rounded-full bg-orange-100 px-2.5 py-0.5 text-sm font-bold text-orange-600">
                      {upcomingSessions.length}
                    </span>
                  </h2>
                </div>
                {upcomingSessions.length === 0 ? (
                  <EmptyState
                    icon="📅"
                    title="No upcoming interviews"
                    description="Sessions in Draft or In-Progress state will appear here."
                  />
                ) : (
                  <ul className="space-y-3">
                    {upcomingSessions.map((s) => (
                      <SessionCard key={s.id} session={s} onDelete={(id) => void run(() => apiClient.deleteSession(id))} />
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* ── RESOURCES TAB ── */}
            {tab === "resources" && (
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-lg font-bold">
                    Resources / Resumes
                    <span className="ml-2 rounded-full bg-emerald-100 px-2.5 py-0.5 text-sm font-bold text-emerald-700">
                      {resumes.length}
                    </span>
                  </h2>
                </div>
                {resumes.length === 0 ? (
                  <EmptyState
                    icon="📂"
                    title="No resumes uploaded yet"
                    description="Upload your resume to use it across interviews and job applications."
                  />
                ) : (
                  <ul className="mb-6 space-y-3">
                    {resumes.map((r) => (
                      <li
                        key={r.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-background p-4"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">📄</span>
                          <div>
                            <p className="font-semibold text-sm">{r.filename}</p>
                            <span
                              className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                                r.status === "parsed"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : r.status === "failed"
                                  ? "bg-red-100 text-red-600"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {r.status}
                            </span>
                          </div>
                        </div>
                        <button
                          id={`delete-resume-${r.id}`}
                          onClick={() =>
                            void run(() => apiClient.deleteResume(r.id))
                          }
                          className="text-sm font-semibold text-red-400 hover:underline"
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <form
                  id="add-resume-form"
                  className="flex flex-wrap items-end gap-3"
                  onSubmit={(ev) => {
                    ev.preventDefault();
                    if (!resumeFile.trim()) return;
                    void run(async () => {
                      await apiClient.addResume({
                        filename: resumeFile.trim(),
                        storage_key: null,
                        mime_type: null,
                        size_bytes: null,
                      });
                      setResumeFile("");
                    });
                  }}
                >
                  <input
                    id="new-resume-filename"
                    value={resumeFile}
                    onChange={(e) => setResumeFile(e.target.value)}
                    placeholder="resume.pdf"
                    className="flex-1 rounded-xl border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none"
                    aria-label="Resume filename"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white hover:bg-primary/90"
                  >
                    Register Resume
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </div>
      </main>
    </div>
  );
}

/* ────────────────────────── Sub-components ────────────────────────── */

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center py-12 text-center">
      <span className="text-5xl">{icon}</span>
      <p className="mt-4 font-bold text-ink-primary">{title}</p>
      <p className="mt-1 text-sm text-ink-secondary max-w-sm">{description}</p>
    </div>
  );
}

function SessionCard({
  session: s,
  onDelete,
}: {
  session: InterviewSession;
  onDelete: (id: string) => void;
}) {
  const statusColor: Record<string, string> = {
    completed: "bg-emerald-100 text-emerald-700",
    in_progress: "bg-blue-100 text-blue-700",
    draft: "bg-amber-100 text-amber-700",
    abandoned: "bg-red-100 text-red-600",
  };
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-background p-4">
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{s.role}</p>
        <p className="text-xs text-ink-secondary capitalize mt-0.5">
          {s.interview_type} · {s.difficulty} · {s.duration_minutes} min
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
            statusColor[s.status] ?? "bg-border/40 text-ink-secondary"
          }`}
        >
          {s.status.replace("_", " ")}
        </span>
        {s.score != null && (
          <span className="text-sm font-extrabold text-primary">
            {s.score}%
          </span>
        )}
        <button
          onClick={() => onDelete(s.id)}
          className="text-sm font-semibold text-red-400 hover:underline"
        >
          Delete
        </button>
      </div>
    </li>
  );
}

function ItemList({
  items,
  emptyLabel,
  onEdit,
  onDelete,
  editForm,
}: {
  items: {
    id: string;
    title: string;
    subtitle?: string;
    meta?: string;
    badge?: string;
  }[];
  emptyLabel: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  editForm: React.ReactNode;
}) {
  return (
    <div>
      {items.length === 0 && (
        <p className="text-sm text-ink-secondary">{emptyLabel}</p>
      )}
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-2xl border border-border bg-background p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{item.title}</p>
                {item.subtitle && (
                  <p className="text-sm text-ink-secondary">{item.subtitle}</p>
                )}
                {item.meta && (
                  <p className="mt-1 text-xs text-ink-muted">{item.meta}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {item.badge && (
                  <span className="rounded-xl bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                    {item.badge}
                  </span>
                )}
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
      className="mt-4 grid gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-5 sm:grid-cols-2"
      onSubmit={(ev) => {
        ev.preventDefault();
        onSave();
      }}
    >
      {fields.map((f) => (
        <label key={f.name} className="text-sm">
          <span className="mb-1 block font-semibold text-ink-secondary">
            {f.label}
          </span>
          <input
            type={f.type ?? "text"}
            required={f.required}
            value={draft[f.name] ?? ""}
            onChange={(e) => setDraft({ ...draft, [f.name]: e.target.value })}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
      ))}
      <div className="flex gap-3 sm:col-span-2">
        <button
          type="submit"
          className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white hover:bg-primary/90"
        >
          Save Changes
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-border px-5 py-2 text-sm font-semibold text-ink-secondary hover:bg-surface-alt"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
