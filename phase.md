# InterviewAI — Build Phases

Six phases, in order. Do not start a phase's UI/API work until the prior phase's acceptance criteria are met — each phase depends on the state and schema the previous one established. Within a phase, tasks can be parallelized; across phases, they generally cannot.

---

## Phase 1 — Login and Authentication

**Goal:** a candidate can create an account, verify it, log in, and stay securely signed in.

**Scope:**
- Repo scaffolding, CI baseline, initial database migrations.
- Email + password registration, with terms/privacy consent capture.
- Email verification flow.
- Google OAuth login.
- Login / logout.
- Forgot password / reset password.
- Access + refresh token session handling.
- Admin auth layer, separate from candidate auth, with MFA.

**Acceptance criteria:**
- A new user can register, verify their email, and land in the app.
- A returning user can log in via email/password or Google.
- Sessions survive a refresh and expire/refresh correctly.
- Admin accounts require MFA and cannot be reached via the candidate auth path.

---

## Phase 2 — Dashboard (Onboarding → Dashboard)

**Goal:** a verified candidate can build a professional profile through a resumable wizard and land on a personalized dashboard.

**Scope:**
- Onboarding wizard: basic profile → education → experience → skills → career preferences → resume upload (optional/skippable).
- Resume upload → validation → object storage → parsing job → structured extraction → user-confirmed review.
- Profile completion percentage calculation (weighted, not all-fields-mandatory).
- Dashboard: profile completion meter, average score, interview count, performance trend chart, weak-skill breakdown, "Start New Interview" CTA.

**Acceptance criteria:**
- Onboarding progress persists between steps (a candidate can leave and resume).
- Resume extraction is shown for review and never silently overwrites candidate-entered data.
- Dashboard is personalized immediately after onboarding, even with partial data.

---

## Phase 3 — CRUD Operations

**Goal:** all core entities (profile, education, experience, skills, resumes, and — for admins — question bank and job roles) are fully manageable, not just creatable during onboarding.

**Scope:**
- Full CRUD for profile, education entries, experience entries, skills, and career preferences (edit/delete after initial onboarding, not just create).
- Full CRUD for resumes (upload new version, view, delete, re-analyze).
- Admin CRUD for the question bank (question text, role, topic, difficulty, category, expected concepts, ideal answer, evaluation rubric, follow-up rules, source, version, status).
- Admin CRUD for job roles and companies.
- Interview session record CRUD (create/list/retrieve/finish) at the data layer — the live interview *experience* itself is Phase 4.

**Acceptance criteria:**
- A candidate can edit or remove any profile entry made during onboarding without re-running the wizard.
- An admin can add, edit, retire, and version a question-bank entry without a deploy.
- Every CRUD action for candidate-owned data is scoped server-side to that candidate only.

---

## Phase 4 — Additional Features (Interview Engine + AI)

**Goal:** the actual interview experience — this is the core product.

**Scope:**
- Interview setup screen (role, type, experience, difficulty, duration, language, mode).
- Interview session state machine (`DRAFT → ... → REPORT_READY`, with failure states).
- Context Builder + AI Orchestrator (question generation, follow-ups, adaptive difficulty).
- Structured Evaluation Engine against the documented rubric, with schema-validated AI output.
- Score Engine (weighted rubric aggregate) and Report Generator (scores + evidence + strengths/weaknesses + practice plan).
- Recommendation Engine (learning plan).
- Notifications for interview completion / report ready.
- *Then, as explicit sub-phases once the text-based loop is solid:*
  - **4a — Voice:** mic capture, WebRTC/WebSocket audio transport, Whisper STT, TTS response, optional consent-gated audio storage.
  - **4b — Coding interviews:** Monaco editor, submission API, sandboxed Judge0 execution, test cases, code scoring.
  - **4c — RAG:** curated knowledge base ingestion pipeline (parse → chunk → embed → vector DB), retrieval-grounded question/evaluation context.
  - **4d — Admin analytics:** interview analytics, AI logs, security event dashboard.

**Acceptance criteria:**
- An interview can run for at least 10 turns with reliably persisted, resumable state.
- Every answer produces a structured evaluation record with evidence, not a bare score.
- Adaptive difficulty visibly changes question selection based on prior answers.
- The final report includes weighted scores, strengths, weaknesses, and a concrete recommendation.

---

## Phase 5 — Testing and Quality Assurance

**Goal:** confidence that the product behaves correctly and safely before real users rely on it.

**Scope:**
- Unit tests: validation logic, scoring math, state-machine transitions, resume-parser transforms.
- Integration tests: full registration-through-report-generation path.
- Contract tests: AI structured-output schemas (question generation, evaluation JSON).
- End-to-end tests: complete candidate flow in a real browser.
- Security tests: authorization boundaries, upload handling, abuse/rate-limit behavior, prompt-injection resistance on resume/JD ingestion.
- Load tests: concurrent interview sessions and background workers under load.
- Evaluation-set tests: a fixed set of sample answers checked for scoring consistency and regression whenever prompts/rubrics change.

**Acceptance criteria:**
- All items in the PRD's acceptance-criteria list are covered by at least one automated test.
- No known way for one candidate to read or modify another candidate's data.
- CI blocks merges on failing tests for the core interview loop.

---

## Phase 6 — Deployment and Maintenance

**Goal:** ship it, keep it healthy, and keep improving it safely.

**Scope:**
- Containerization (Docker) and CI/CD pipeline.
- Environment/secret management, staging + production environments.
- Monitoring: frontend, backend, AI latency/error, database, queue, and voice-failure monitoring (Sentry or equivalent).
- Product analytics wired to the funnel events defined in the PRD (signup, onboarding, resume, interview, report, practice).
- Admin system-health view.
- Data retention and deletion workflows for consent-driven data (resume, voice, video, interview history).
- Ongoing: dependency updates, incident response process, periodic review of AI evaluation-set regression results.

**Acceptance criteria:**
- A deploy can go from merged PR to production through CI/CD without manual file copying.
- Errors and AI failures are visible in monitoring within minutes, not discovered by users first.
- A candidate's data-deletion request can actually be fulfilled end to end (profile, resume object, interview history).
