"""FastAPI application entrypoint. Modular monolith — one service (rule.md §1)."""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.admin_questions import router as admin_questions_router
from .api.ai_tools import router as ai_tools_router
from .api.auth import router as auth_router
from .api.communication import router as communication_router
from .api.crud import router as crud_router
from .api.jobs import router as jobs_router
from .api.onboarding import router as onboarding_router
from .api.resume_ai import router as resume_ai_router
from .api.resume_analysis import router as resume_analysis_router
from .core.config import get_settings

settings = get_settings()

app = FastAPI(title=settings.app_name, version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth_router)
app.include_router(onboarding_router)
app.include_router(crud_router)
app.include_router(resume_ai_router)
app.include_router(resume_analysis_router)
app.include_router(jobs_router)
app.include_router(ai_tools_router)
app.include_router(communication_router)
app.include_router(admin_questions_router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
