# InterviewAI — Project Memory

This file is a living document. Unlike `PRD.md` / `architecture.md` / `rule.md` / `phase.md` / `design.md` (which define the plan), this file tracks *actual state* — what's been decided, what's been built, what's in progress, and what's next. Whichever AI agent works on this repo should read this file first each session and update it before ending the session.

---

## 1. Memory (Constants, Decisions, Patterns)

**Key decisions locked in so far:**
- Product: InterviewAI — AI mock interview platform. MVP scope = Candidate + Admin roles only; Company/College roles are explicitly post-MVP (see `PRD.md` §2).
- Architecture: modular monolith first (`rule.md` §1) — do not split into microservices prematurely.
- Stack as specified in `architecture.md` §3: Next.js/TypeScript frontend, FastAPI/Python backend, PostgreSQL + Redis, Supabase Auth, Cloudflare R2 object storage.
- **Open decision, not yet resolved:** whether this is built inside Lovable (which only supports React+Vite+Supabase, no standalone FastAPI) or as a custom-hosted Next.js/FastAPI app. Resolve this before Phase 1 implementation starts — it changes the backend approach materially. See the callout in `architecture.md` §3.
- Interview scoring rubric weights: Technical 30%, Communication 20%, Problem Solving 15%, Relevance 15%, Confidence/Clarity 10%, Fluency 5%, Grammar 5% (`PRD.md`-adjacent source doc).
- Design direction: dark, glassmorphism, "Google Antigravity"-inspired aesthetic; aiApply-style sidebar/navigation structure as a UX reference; exact palette pending real reference images (`design.md`).

**User preferences to keep re-applying:**
- Prefers to start with a working MVP and expand iteratively rather than building everything up front.
- Moves quickly from idea to wanting complete, deployable artifacts — avoid long back-and-forth before producing something concrete.
- Consistently favors premium, polished dark UI aesthetics across projects.

---

## 2. What Happened (Change Log)

Keep entries short, newest first. Log every major schema change, feature completion, architectural pivot, or deleted/abandoned direction — and *why*, not just *what*.

| Date | Change | Notes |
|---|---|---|
| 2026-08-23 | **Phase 2 shipped: onboarding wizard + personalized dashboard.** Backend: `app/api/onboarding.py` (resumable wizard state, education/experience/skills/preferences CRUD-lite, weighted completion %, `/dashboard` aggregate), `app/schemas/onboarding.py`, Alembic migration `109d9ec6c148`. Frontend: `/onboarding` multi-step wizard with resumable state, real `/dashboard` with completion meter + stats + "Start New Interview" CTA. Services added to `services/api.ts`. Tests 3/3 pass; `next build` clean. | Resume upload/parsing deferred — wizard step is skippable per phase.md; parsing job lands with Phase 3/4 storage work. Build needs `NODE_OPTIONS=--max-old-space-size=4096` on this machine (OOM at default heap). |
| 2026-08-23 | **Phase 2 shipped: onboarding wizard + personalized dashboard.** Backend: `app/api/onboarding.py` (step save/get, education/experience/skills/preferences CRUD-lite, completion %), `app/schemas/onboarding.py`, models already in `models/onboarding.py`. Frontend: `/onboarding` multi-step wizard with resumable state, `/dashboard` with profile-completion meter, stats cards, weak-skill breakdown, "Start New Interview" CTA. Services added to `services/api.ts`. | Resume upload/parsing deferred — wizard step is skippable per phase.md; parsing job lands with Phase 3/4 storage work. |
| 2026-08-22 | **Auth provider switched from Supabase Auth to Firebase Auth** (user decision). Frontend: `firebase` JS SDK added; `lib/firebase/auth.ts` handles email/password + Google popup + verification + reset; all auth pages rewritten. Backend: `firebase-admin` verifies ID tokens (`core/firebase.py`, `verify_firebase_id_token`); routes reduced to `/api/auth/sync`, `/api/auth/me`, `/api/auth/logout`; Supabase retained only for Postgres/storage. Tests 3/3 pass, tsc clean. | **Pending user action:** enable Google sign-in provider in Firebase Console (Authentication → Sign-in method) — currently returns `auth/configuration-not-found`. Also add service-account credentials to backend `.env` (FIREBASE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS_PATH) so `/api/auth/sync` and `/me` work. |

**Completed features:** Phase 1 auth on Firebase (email/password + verification, Google popup sign-in, password reset) and the public landing page.

**Known issues / open questions:**
- Google provider not yet enabled in Firebase Console (`auth/configuration-not-found`) — user must enable it under Authentication → Sign-in method and add `http://localhost:3000` to Authorized domains.
- Backend needs Firebase service-account credentials in `.env` for ID token verification of protected routes.
- DATABASE_URL points at local sqlite; switch to the Supabase Postgres URI and run `alembic upgrade head` before real usage.
- Rate limiting on auth endpoints not yet implemented.

---

## 3. Currently Working

- **Active phase:** Phase 2 (onboarding → dashboard) implemented; Phase 3 (full CRUD) is next.
- **Current file/module:** `backend/app/api/onboarding.py`, `frontend/app/onboarding/page.tsx`, `frontend/app/dashboard/page.tsx`.
- **What's next:** Phase 3 — full CRUD for profile/education/experience/skills/resumes (edit/delete after onboarding), admin question-bank CRUD, interview session record CRUD at the data layer.

---

## 4. Update Rules

- Update this file at the end of any session where a decision was made, a feature shipped, or a direction was abandoned — don't let it go stale.
- When a "Known issue" is resolved, move it out of §2's open-questions list and log the resolution as a dated change-log entry instead of leaving both versions in the file.
- When "Currently Working" changes, overwrite it — it should always reflect the *current* state, not a history (the history lives in §2).
- Periodically prune the change log: once a decision is fully absorbed into `PRD.md`/`architecture.md`/`rule.md`, it doesn't need to keep living here in duplicate detail — a one-line reference is enough.

---

## 5. Purpose

This file exists so that context survives across sessions and across different AI tools touching this repo: so productivity and consistency don't reset every time a new session starts, and so decisions already made (like the scoring weights or the modular-monolith call) aren't accidentally re-litigated or contradicted later. If something important was decided, it belongs here — not just in a chat transcript that won't be read again.
