# InterviewAI — Architecture

This file defines *how* the system is built: the components, how they talk to each other, the folder layout, and the technology stack. Any AI coding agent should treat unlisted components as out of scope, and should not introduce a new service, table, or major dependency without updating this file first.

---

## 1. Architecture Overview

### 1.1 Master resource architecture

```
USER
 │
 ▼
WEB APPLICATION (Next.js + TypeScript)
 │  HTTPS / WebSocket
 ▼
API / BACKEND (FastAPI)
 │
 ├── Authentication ──► Auth Provider (Supabase Auth / JWT)
 ├── Candidate Data ──► PostgreSQL ──► Profile / Resume / History
 └── Interview Engine ──► AI Orchestrator ──► Question AI / Eval AI / Feedback AI
                                   │
                                   ▼
                        Score / Recommendation Engine
                                   │
                                   ▼
                        Dashboard / Report
```

### 1.2 The most important rule

Do **not** build this as `Frontend → one AI API call → Answer`. Every interview turn goes through a context-building and orchestration layer:

```
USER → FRONTEND → API LAYER
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
     PROFILE       RESUME      INTERVIEW
        │            │            │
        └────────────┼────────────┘
                      ▼
              CONTEXT BUILDER
                      ▼
              AI ORCHESTRATOR
                      │
        ┌─────────────┼──────────────┐
        ▼             ▼              ▼
    QUESTION      EVALUATION      FEEDBACK
        │             │              │
        └─────────────┼──────────────┘
                       ▼
                SCORE ENGINE
                       ▼
                RECOMMENDATIONS
                       ▼
                    REPORT
                       ▼
                  DASHBOARD
```

The Context Builder assembles a bounded, structured payload for the LLM — never the raw database. It includes: candidate (role, experience, skills, resume facts), interview (type, difficulty, progress, questions already asked), current turn (question + answer), history (prior question summaries + performance), and role (required skills + rubric).

### 1.3 Backend component map

```
API / ROUTER
       │
 ┌─────────────┬──────────────┐
 ▼             ▼              ▼
AUTH        PROFILE        INTERVIEW
             │                 │
             ▼                 ▼
          RESUME         AI ORCHESTRATOR
             │            ┌────┼─────┐
             │            ▼    ▼     ▼
             │        QUESTION EVAL FEEDBACK
             │            │    │     │
             └────────────┴────┴─────┘
                          ▼
                    SCORE ENGINE
                     ┌────┴────┐
                     ▼         ▼
                 REPORTS     REDIS
                     ▼
                POSTGRESQL
                     ▼
              OBJECT STORAGE
```

### 1.4 AI orchestration flow (per interview turn)

```
Candidate Context → Context Builder → Question Policy
                                        (topic selection, difficulty,
                                         question type, avoid duplicates)
                                        │
                                        ▼
                                Question Generator → AI Interviewer
                                                          │
                                                          ▼
                                                  Candidate Answer
                                                          │
                                                          ▼
                                                 Evaluation Engine
                              (correctness · relevance · completeness ·
                               technical depth · communication)
                                                          │
                                                          ▼
                                               Difficulty Controller
                                                          │
                                          ┌───────────────┴───────────────┐
                                          ▼                               ▼
                                     Follow-up                     Next Question
```

### 1.5 Interview session state machine

```
DRAFT → CONFIGURED → STARTING → ACTIVE → ASKING → WAITING_FOR_ANSWER
   → PROCESSING → EVALUATING → { FOLLOW_UP | NEXT_QUESTION } → COMPLETED
   → SCORING → REPORT_READY

Failure states (reachable from any active state): PAUSED · CANCELLED · EXPIRED · FAILED
```

State transitions must be enforced server-side. The frontend reflects state, it does not decide it. Idempotency keys are required on answer-submission to prevent duplicate records on retry.

### 1.6 Data domain separation

Keep these five domains logically separate even inside one database — do not collapse everything into a single `users` table:

```
AUTH DATA        → identity, email, verification, session
PROFILE DATA      → name, location, education, experience, skills, preferences
CAREER DATA       → resume, projects, target role, job preferences, certifications
INTERVIEW DATA    → sessions, questions, answers, scores, reports
OPTIONAL MEDIA    → profile photo, audio, video (opt-in, object storage only)
```

### 1.7 Voice-ready pipeline (architecture reserved for Phase 4, not built in MVP)

```
Browser Mic → WebRTC / Media Capture → Audio Transport → Speech-to-Text (Whisper)
   → Transcript → AI Evaluation → Text Response → Text-to-Speech → Browser Audio
```

### 1.8 Resume extraction pipeline

```
PDF/DOCX Upload → File Validator → Store Object → Queue Job
   → Text Extractor (native text, OCR fallback for scans)
   → Document Normalizer → LLM/NLP Extraction → Structured JSON
   → Validation → User Confirmation → PostgreSQL
```

### 1.9 RAG / knowledge grounding

Transactional candidate and interview data lives in PostgreSQL. A vector database is used **only** for approved semantic-search content (curated technical knowledge, interview guidelines) — never for candidate PII or transaction records.

```
knowledge-base/
├── java/ · python/ · sql/ · javascript/ · react/ · spring-boot/
├── networking/ · operating-systems/ · dbms/ · system-design/
└── behavioral/ · interview-guidelines/

Source Document → Parser → Chunker → Metadata → Embedding → Vector DB → Retriever → AI Context
```

Every source document is versioned with `source_id, source_type, owner, version, license, confidence, status`.

### 1.10 Background jobs

Do not process expensive or slow work inside the HTTP request path. Use a worker queue for: resume parsing, OCR, resume AI extraction, embedding generation, report generation, PDF creation, audio/video processing, large analytics jobs, and outbound emails/notifications.

```
API → Create Job → Redis Queue → Worker → Process → Database Update → Frontend Notification
```

---

## 2. Folder and File Structure

### 2.1 Frontend (`/frontend`)

```
frontend/
├── app/
│   ├── (public)/            → landing, pricing, legal
│   ├── auth/                → register, login, verify, reset-password
│   ├── onboarding/          → profile, education, experience, skills, career, resume
│   ├── dashboard/           → overview, interviews, reports, progress, settings
│   ├── interview/           → setup, live, paused, result
│   └── admin/               → users, interviews, questions, knowledge, reports, system
│
├── components/
│   ├── ui/                  → base primitives (shadcn/ui)
│   ├── forms/                → onboarding + profile forms
│   ├── interview/            → live interview UI, question card, answer input
│   ├── charts/                → performance trend, skill breakdown (Recharts)
│   └── voice/                  → mic capture, waveform, playback (voice-ready, Phase 4)
│
├── services/                 → typed API clients per domain (auth, profile, resume, interview)
├── hooks/                     → data-fetching + interaction hooks
├── store/                      → Zustand stores (live interview/session state)
└── types/                       → shared TypeScript types/interfaces
```

State-management pattern per concern:

| Concern | Pattern |
|---|---|
| Authentication | Provider / secure session context |
| Forms | React Hook Form + Zod schema validation |
| Server data | TanStack Query |
| Live interview | Session state machine + local Zustand store |
| Charts | Derived from server data, no separate store |
| Feature flags | Server-configured |

### 2.2 Backend (`/backend`)

```
backend/
├── app/
│   ├── api/                  → route modules: auth, profile, education, experience,
│   │                            skills, resume, interviews, reports, admin
│   ├── core/                  → config, security, dependencies
│   ├── models/                  → SQLAlchemy models (one file per domain)
│   ├── schemas/                  → Pydantic request/response schemas
│   ├── services/                   → business logic (resume parsing, scoring, orchestration)
│   ├── ai/
│   │   ├── context_builder.py
│   │   ├── question_generator.py
│   │   ├── evaluator.py
│   │   └── recommendation_engine.py
│   ├── workers/                     → Celery/ARQ tasks (resume parsing, reports, notifications)
│   └── db/                            → session, migrations entrypoint
├── alembic/                             → database migrations
└── tests/                                 → unit, integration, contract, e2e-support
```

### 2.3 Object storage layout (Cloudflare R2 or S3-compatible)

```
/resumes
/resume-previews
/interview-audio
/interview-video
/reports
/profile-images
/coding-submissions
/exported-data
```

Never store resume PDFs, audio, or video blobs directly in PostgreSQL — store the object, keep only the reference/metadata in the database.

---

## 3. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend framework | Next.js + React + TypeScript | App Router |
| Styling | Tailwind CSS + shadcn/ui | Consistent design system, see `design.md` |
| Forms | React Hook Form + Zod | Client + server schema validation |
| Server state | TanStack Query | All API data fetching/caching |
| Local/live state | Zustand | Live interview session state only |
| Charts | Recharts | Score/progress visualization |
| Code editor (Phase 5) | Monaco Editor | Coding interview only |
| Realtime/media | WebRTC / WebSocket | Voice pipeline, Phase 4 |
| Backend framework | FastAPI (Python) | Strongly-typed API contracts across many independent services |
| Validation | Pydantic | Request/response schemas |
| ORM | SQLAlchemy + Alembic | Models + migrations |
| Background jobs | Celery or ARQ | Resume parsing, OCR, embeddings, reports, notifications |
| Cache / queue / sessions | Redis | Never the source of truth for permanent candidate data |
| Database | PostgreSQL (Supabase-managed for MVP) | System of record |
| Auth | Supabase Auth | Password, email verification, Google OAuth, JWT + RLS-ready |
| Object storage | Cloudflare R2 (S3-compatible) | Resumes, audio, video, reports, images |
| Resume parsing | PyMuPDF + python-docx + OCR fallback | Native text first, OCR only when needed |
| Voice (Phase 4) | Whisper (STT) + a TTS provider | Multilingual-capable |
| Coding sandbox (Phase 5) | Monaco + Judge0 | Never execute candidate code inside the API server |
| Vector DB (Phase 6 / RAG) | A managed vector database | Curated knowledge only, not candidate data |
| Monitoring | Sentry | Frontend, backend, AI latency/error tracking |
| Analytics | PostHog | Funnel + retention events, kept separate from transactional DB |
| Deployment | Docker + CI/CD | See `phase.md` Phase 6 |

**Build-tool note:** if this project is going to be built inside **Lovable**, be aware that Lovable's runtime only supports React + Vite + TypeScript + Tailwind on the frontend and has no ability to run a standalone Python/FastAPI backend — it integrates with Supabase for backend needs (auth, Postgres, storage, edge functions) instead. That is compatible with the Database/Auth/Storage rows above, but **not** with a literal Next.js + FastAPI setup as written. If Lovable is the intended build environment, the stack above should be adapted to React (Vite) on the frontend and Supabase (Postgres + Auth + Storage + Edge Functions) in place of a separate FastAPI service — flag this decision explicitly before implementation starts rather than assuming either direction.
