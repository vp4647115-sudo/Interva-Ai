"""FastAPI application entrypoint. Modular monolith — one service (rule.md §1)."""
from __future__ import annotations

import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .api.admin_questions import router as admin_questions_router
from .api.ai_tools import router as ai_tools_router
from .api.auth import router as auth_router
from .api.communication import router as communication_router
from .api.crud import router as crud_router
from .api.files import router as files_router
from .api.interview_engine import router as interview_engine_router
from .api.jobs import router as jobs_router
from .api.onboarding import router as onboarding_router
from .api.resume_ai import router as resume_ai_router
from .api.resume_analysis import router as resume_analysis_router
from .core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

app = FastAPI(title=settings.app_name, version="0.1.0")

app.include_router(auth_router)
app.include_router(onboarding_router)
app.include_router(crud_router)
app.include_router(admin_questions_router)
app.include_router(ai_tools_router)
app.include_router(communication_router)
app.include_router(jobs_router)
app.include_router(resume_ai_router)
app.include_router(resume_analysis_router)
app.include_router(files_router)
app.include_router(interview_engine_router)


@app.get("/")
async def root() -> dict[str, str]:
    return {"status": "ok", "service": settings.app_name, "docs": "/docs"}


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Return unhandled errors as JSON *inside* the middleware stack.

    Without this, an unhandled exception propagates to Starlette's
    ServerErrorMiddleware, which sits OUTSIDE CORSMiddleware — the resulting
    plain 500 carries no Access-Control-Allow-Origin header and the browser
    reports it as a CORS failure, hiding the real server-side error.
    """
    logger.exception("Unhandled error while serving %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


# Keep CORS outside Starlette's error middleware so even uncaught 500 responses
# carry the headers browsers need to expose the actual API response.
# Local Next.js dev servers often auto-increment when ports 3000-3002 are in use,
# so we allow localhost + 127.0.0.1 on any common development port in addition to
# the configured production origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_origin,
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "http://127.0.0.1:3003",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With"],
    expose_headers=["Content-Type"],
)
