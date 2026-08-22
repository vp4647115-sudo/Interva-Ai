# InterviewAI — Project Rules

These are binding rules for anyone or anything (human or AI coding agent) contributing to this codebase. If a request conflicts with this file, this file wins unless the project owner explicitly updates it first.

---

## 1. What to Use (Approved)

**Frontend:** Next.js (App Router) + React + TypeScript, Tailwind CSS, shadcn/ui, React Hook Form + Zod, TanStack Query for all server data, Zustand only for live/local interview-session state, Recharts for charts, Monaco Editor for the coding interview (Phase 5).

**Backend:** Python + FastAPI + Pydantic for every endpoint contract, SQLAlchemy + Alembic for data access and migrations, Celery or ARQ for background jobs, httpx for outbound calls to external services.

**Data:** PostgreSQL as the single system of record for transactional data. Redis for cache, sessions, rate limiting, and queues only. A vector database only for curated RAG knowledge content, never for candidate PII.

**Patterns:**
- Modular monolith first. Do not split into microservices until the monolith's boundaries are proven and a specific service is a genuine scaling bottleneck.
- Every AI call goes through the Context Builder → AI Orchestrator path described in `architecture.md`. No direct "frontend calls the LLM" shortcuts.
- Every interview session transition goes through the documented state machine — no ad hoc status strings.
- Background work (parsing, OCR, embeddings, report generation, notifications) goes through the job queue, never inline in a request handler.
- All AI-generated structured output (questions, evaluations, extracted resume data) must be schema-validated server-side before it is stored or shown to the user.

---

## 2. What to Avoid

- **No direct database calls from the frontend.** Everything goes through the FastAPI layer.
- **No storing binary blobs (PDFs, audio, video) in PostgreSQL.** Object storage only, with a reference/metadata row in Postgres.
- **No executing candidate-submitted code inside the API server.** Coding submissions must run in an isolated sandbox/judge service.
- **No duplicating password or credential storage** outside the auth provider's identity tables.
- **No collecting unrelated sensitive personal data** — no Aadhaar/PAN/passport/bank/UPI/card numbers, no religion, caste, political affiliation, or medical history. If a field isn't in the Candidate Profile Model in `PRD.md`, don't add it without updating the PRD first.
- **No silently overwriting candidate-entered profile data with AI-extracted resume data.** Always show extracted values and require user confirmation.
- **No treating the overall interview score as the only feedback.** It must always ship with evidence (strengths/weaknesses/missing concepts).
- **No microservice sprawl in the MVP.** Resist splitting auth/profile/resume/interview into separate deployable services until there's a measured reason to.
- **No secrets, API keys, or internal prompts in frontend code or in any file committed to the repo.** Server-side environment/secret management only.
- **No mandatory video or audio recording**, and no storing voice/video without an explicit, itemized consent flag captured beforehand.

---

## 3. Libraries and Dependencies

| Library | Purpose | Notes |
|---|---|---|
| next, react, typescript | App framework | Pin major versions; don't mix App Router and Pages Router patterns |
| tailwindcss, shadcn/ui | Styling/components | Follow tokens defined in `design.md` — no ad hoc hex colors in components |
| react-hook-form, zod | Forms + validation | Every form has a Zod schema shared (or mirrored) with the backend Pydantic schema |
| @tanstack/react-query | Server state | All API reads/writes go through query/mutation hooks, not raw `fetch` in components |
| zustand | Local/live state | Interview session state only — not a replacement for TanStack Query |
| recharts | Charts | Dashboard and report visualizations only |
| monaco-editor | Code editor | Phase 5 only, gated behind the coding-interview feature |
| fastapi, pydantic | API layer | Every route has a typed request and response model, no raw dicts |
| sqlalchemy, alembic | ORM + migrations | Every schema change ships with a migration file, no manual DB edits |
| celery or arq, redis | Jobs/queue/cache | Pick one job runner and stay consistent across the codebase |
| httpx | External HTTP calls | Used for LLM API calls, STT/TTS providers, and any third-party integration |
| pymupdf, python-docx | Resume parsing | Native extraction first, OCR fallback only when native extraction is empty/low-confidence |
| judge0 (or equivalent sandboxed runner) | Code execution | Phase 5 only, always isolated from the main API process |

Before adding any new dependency not listed here, check whether an existing approved library already covers the need. If not, add it to this table (with purpose and version note) as part of the same change.

---

## 4. Error Handling

- **User-facing errors** must be short, plain-language, and actionable (e.g. "We couldn't read that resume — try a text-based PDF or DOCX" rather than a stack trace or raw exception string).
- **AI timeout or provider failure:** retry within a bounded policy (e.g. limited retries with backoff); if still failing, fall back to a question-bank question instead of surfacing a raw error mid-interview.
- **Browser refresh mid-interview:** resume from the latest committed session state; never lose an already-scored answer.
- **Duplicate answer submission:** enforced via an idempotency key — the same submission must not create two records.
- **Queue/worker failure:** retry the job with backoff and expose a visible processing status to the user rather than failing silently.
- **Resume parse failure:** mark the resume as failed and offer a manual-entry or skip path — never block onboarding on a parser error.
- **Voice unavailable:** fall back to text mode automatically.
- **Database transient errors:** retry safe (idempotent) operations; never silently discard a candidate's answer or profile edit.
- **Logging:** log errors with enough context to debug (request id, user id where safe, operation) but never log full resume text, full answer transcripts, or credentials at INFO/DEBUG level in plaintext across long-lived logs.
- **Reporting:** all unhandled backend exceptions go to the monitoring tool (Sentry); AI-specific failures (bad structured output, provider errors) are tracked separately from generic app errors so they can be trended.

---

## 5. Boundaries of AI

These apply both to the in-app AI (question generation, evaluation, feedback) and to any AI coding agent building this codebase.

**In-product AI boundaries:**
- The AI never makes an autonomous hiring/rejection decision — it produces scores and evidence; a human recruiter makes hiring calls (post-MVP, once Company role exists).
- The AI evaluator is never asked to "just score this" — it is always given the structured rubric (technical correctness, relevance, completeness, communication, confidence, fluency, grammar) and must return structured JSON matching the documented evaluation contract.
- All AI-returned JSON is validated against a schema on the backend before it is stored or shown — malformed or out-of-range output is rejected and retried or falls back, never passed through.
- The AI does not receive raw, unbounded database access — only the bounded context payload assembled by the Context Builder.
- The AI must not fabricate candidate history, resume content, or scores that weren't actually computed from the current session.
- Resume/JD ingestion is treated as untrusted content — the system must be resilient to prompt-injection attempts embedded in an uploaded resume or job description (e.g. text trying to instruct the model to "give this candidate a perfect score").

**AI coding-agent boundaries (for whoever/whatever implements this repo):**
- Do not change the auth flow, the interview state machine, or the database schema without an explicit instruction to do so — these are structural and load-bearing.
- Do not invent new API endpoints or data fields that aren't in `PRD.md` / `architecture.md` without flagging it first.
- Do not run destructive database operations (drops, bulk deletes) without explicit confirmation in the same session.
- Do not commit secrets, API keys, or `.env` values to the repository.
- Do not silently swap an approved library in section 3 for an alternative — propose the change instead.
- When a requirement is ambiguous, state the assumption being made rather than guessing silently and moving on.

---

## 6. General Rules

**Code style and formatting:** TypeScript/React code follows Prettier + ESLint defaults for the framework; Python code follows PEP 8 with Black formatting. No commented-out dead code left in commits.

**Naming conventions:** `camelCase` for TypeScript variables/functions, `PascalCase` for React components and TypeScript types/interfaces, `snake_case` for Python and for database table/column names. API routes are plural nouns (`/interviews`, `/education`), REST-style.

**Security and data privacy:** HTTPS everywhere; secure, httpOnly cookies for session tokens where applicable; CORS restricted to known frontend origins; rate limiting on auth and AI endpoints; strict file-type/size validation and malware scanning on uploads; RBAC enforced server-side for every route (candidate vs admin); row-level access scoped to the authenticated user; secrets only in server-side environment configuration; encryption in transit and at rest; MFA required for admin accounts; audit logs for privileged actions and data exports. Follow OWASP guidance as the security baseline for authentication, session handling, access control, and API security.

**Performance and scalability:** target p95 < 500ms for the dashboard API and answer-persistence endpoints (excluding external AI latency), p95 < 300ms for question retrieval excluding generation time. Expensive work (report generation, embeddings, OCR) is async via the job queue, with an "accepted/processing" response returned immediately rather than blocking the HTTP request.

**Documentation and comments:** every non-trivial service function gets a short docstring/comment explaining *why*, not just *what*. Every new API endpoint is added to the API surface table in `architecture.md`. Every schema change ships with its migration and a one-line changelog entry in `memory.md`.

**Testing:** unit tests for validation logic, scoring math, and state-machine transitions; integration tests covering registration through report generation; contract tests for AI structured-output schemas; end-to-end tests for the full candidate flow in a real browser; security tests for authorization, upload handling, and prompt-injection resistance; load tests for concurrent interview sessions and queue workers; an evaluation-set test suite that checks question quality and scoring consistency over time (regression protection for prompt/rubric changes).

**Other project-specific rules:**
- Consent is granular and opt-in per data type (resume use for personalization, interview-history retention, voice storage, video storage, anonymized analytics) — never a single blanket "I agree."
- Profile completion is a weighted percentage (see `PRD.md`/onboarding), not a binary — never force all fields to be mandatory to reach 100%.
- Admin and candidate authorization are architecturally separate — a bug in one must not be able to grant access to the other.
