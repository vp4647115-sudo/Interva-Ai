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
| 2026-10-05 | **Phase 6 Deployment Foundation Added** — Created Docker containerization and CI workflow scaffolding for backend + frontend (`docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile`, `.github/workflows/ci.yml`) so deployment work has a repeatable starting point. | This completes the missing deployment setup skeleton and gives a path for production container builds and automated validation. |
| 2026-09-14 | **Phase 5 Testing & Quality Assurance Completed** — Built end-to-end integration pipeline tests (`backend/tests/test_phase5_integration.py`), multi-tenant data boundary security tests, and rate-limiting enforcement tests (`backend/tests/test_rate_limiting.py`). All 40/40 backend tests pass with 100% success rate across 14 test modules. | Fully satisfies Phase 5 testing and quality assurance requirements. |
| 2026-09-14 | **Phase 4c RAG Knowledge Base Implemented** — Built sliding window chunking & term-vector retrieval engine (`backend/app/ai/rag_engine.py`), pre-seeded technical knowledge bases (System Design, DSA, STAR behavioral), and integrated RAG retrieval into `context_builder.py`. All 37/37 backend tests pass cleanly. | Fully satisfies Phase 4c RAG knowledge grounding requirements. |
| 2026-09-14 | **Phase 4b Coding Interview Engine Implemented** — Built sandboxed multi-language code execution engine (`backend/app/core/code_executor.py`), `/api/interview-engine/code-run` endpoint, `CodeEditorComponent`, `TestCasePanel`, and integrated coding workspace into `MockInterviewsPage`. All 34/34 backend tests pass cleanly. | Fully satisfies Phase 4b coding interview experience requirements. |
| 2026-09-14 | **Phase 4a Voice & Real-time Audio Pipeline Implemented** — Built `useVoiceAnswer` hook with Web Speech STT & Web Audio volume level analyzer, `useAudioPlayer` TTS hook, `VoiceRecorderControls` component with animated waveform meter, updated `/api/interview-engine` with voice mode & `/tts` endpoint, integrated into `MockInterviewsPage`. All 31/31 backend tests pass cleanly. | Fully satisfies Phase 4a voice interaction requirements. |
| 2026-09-14 | **Onboarding Welcome Email Dynamic Variables & Metadata Updated** — Updated `generate_welcome_email` in `backend/app/core/email_service.py` to support dynamic variables (`{{APP_URL}}` via `app_url`, `{{USER_NAME}}` via `name`, `{{USER_EMAIL}}` via `user_email`), sender metadata (`Interview AI`), and preheader preview text (`Your profile is ready. Let's prepare you for your next interview.`). All 25 backend tests pass. |
| 2026-09-14 | **Phase 4 Core AI Interview Engine Implemented** — Built server-enforced multi-turn session state machine (`backend/app/api/interview_engine.py`), Context Builder (`backend/app/ai/context_builder.py`), Evaluator & Score Engine with 7-part weighted rubric (`backend/app/ai/evaluator.py`, `backend/app/ai/score_engine.py`), `InterviewTurn` & `InterviewReport` models (`backend/app/models/interview.py`), frontend service client (`frontend/services/interviewService.ts`), and upgraded Mock Interviews multi-turn & report card UI (`frontend/app/mock-interviews/page.tsx`). 25/25 backend pytest pass, frontend tsc clean. | Fully satisfies Phase 4 interview experience requirements. |
| 2026-08-26 | **Wired missing routers into `backend/app/main.py`** — `ai_tools`, `communication`, `jobs`, `resume_ai`, and `resume_analysis` routers existed but were never registered, so every AI-tools/communication/jobs/resume-AI endpoint returned 404. All 9 routers now included; CORS verified working for GET and PUT preflights from `http://localhost:3000`. Backend tests 7/7 pass, frontend tsc clean, both servers verified running locally (uvicorn :8000, next dev :3000). | Root cause of earlier "CORS failure" reports on PUT `/api/onboarding/state` was likely a mix of the unregistered-router 404s and server not running; preflight now returns 200 with correct ACAO headers. |
| 2026-08-22 | **Auth provider switched from Supabase Auth to Firebase Auth** (user decision). Frontend: `firebase` JS SDK added; `lib/firebase/auth.ts` handles email/password + Google popup + verification + reset; all auth pages rewritten. Backend: `firebase-admin` verifies ID tokens (`core/firebase.py`, `verify_firebase_id_token`); routes reduced to `/api/auth/sync`, `/api/auth/me`, `/api/auth/logout`; Supabase retained only for Postgres/storage. Tests 3/3 pass, tsc clean. | **Pending user action:** enable Google sign-in provider in Firebase Console (Authentication → Sign-in method) — currently returns `auth/configuration-not-found`. Also add service-account credentials to backend `.env` (FIREBASE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS_PATH) so `/api/auth/sync` and `/me` work. |

**Completed features:** Phase 1 auth, Phase 2 onboarding & dashboard, Phase 3 CRUD operations, Phase 4 AI Core Interview Engine, Phase 4a Voice Pipeline, Phase 4b Coding Interview Engine, Phase 4c RAG Knowledge Base, Phase 5 Testing & Quality Assurance.

---

## 3. Currently Working

- **Active phase:** Phase 6 deployment scaffolding completed. Remaining work is environment-specific hardening: add production secrets, tune Docker health checks, and wire real deployment monitors.
- **Current file/module:** `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile`, `.github/workflows/ci.yml`.
- **What's next:** Finalize environment variables, add production health checks/monitoring, and then move from local container scaffolding to a hosted deployment target.




---


- **Active phase:** Phase 4 — Core Interview Engine (session state machine, Context Builder, structured evaluator, weighted score engine, report generator, multi-turn UI).
- **Current file/module:** `backend/app/models/interview.py`, `backend/app/ai/context_builder.py`, `backend/app/api/interview_engine.py`, `frontend/services/interviewService.ts`, `frontend/app/mock-interviews/page.tsx`.
- **What's next:** User approval of implementation plan, then implementation of backend models, context builder, evaluator, API routes, frontend UI, and unit tests.

---

## 4. Update Rules

- Update this file at the end of any session where a decision was made, a feature shipped, or a direction was abandoned — don't let it go stale.
- When a "Known issue" is resolved, move it out of §2's open-questions list and log the resolution as a dated change-log entry instead of leaving both versions in the file.
- When "Currently Working" changes, overwrite it — it should always reflect the *current* state, not a history (the history lives in §2).
- Periodically prune the change log: once a decision is fully absorbed into `PRD.md`/`architecture.md`/`rule.md`, it doesn't need to keep living here in duplicate detail — a one-line reference is enough.

---

## 5. Purpose

This file exists so that context survives across sessions and across different AI tools touching this repo: so productivity and consistency don't reset every time a new session starts, and so decisions already made (like the scoring weights or the modular-monolith call) aren't accidentally re-litigated or contradicted later. If something important was decided, it belongs here — not just in a chat transcript that won't be read again.
