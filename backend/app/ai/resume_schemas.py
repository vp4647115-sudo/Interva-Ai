"""Pydantic contracts for the AI resume generation pipeline."""
from __future__ import annotations

from pydantic import BaseModel, Field


class ExperienceIn(BaseModel):
    title: str = ""
    company: str = ""
    dates: str = ""
    description: str = ""


class ProjectIn(BaseModel):
    name: str = ""
    technologies: str = ""
    description: str = ""


class EducationIn(BaseModel):
    degree: str = ""
    school: str = ""
    dates: str = ""


class GenerateRequest(BaseModel):
    target_role: str = Field(min_length=1, max_length=120)
    full_name: str = Field(min_length=1, max_length=120)
    field_type: str = Field(default="software", max_length=60)
    email: str = ""
    phone: str = ""
    location: str = ""
    linkedin: str = ""
    summary_hint: str = ""
    skills: list[str] = Field(default_factory=list, max_length=60)
    experience: list[ExperienceIn] = Field(default_factory=list, max_length=15)
    projects: list[ProjectIn] = Field(default_factory=list, max_length=15)
    education: list[EducationIn] = Field(default_factory=list, max_length=10)
    job_description: str = Field(default="", max_length=6000)


class ResumeStrategy(BaseModel):
    layout: str = "professional_single_column"
    section_order: list[str] = Field(default_factory=list)
    rationale: str = ""


class GeneratedExperience(BaseModel):
    title: str = ""
    company: str = ""
    dates: str = ""
    bullets: list[str] = Field(default_factory=list)


class GeneratedProject(BaseModel):
    name: str = ""
    technologies: list[str] = Field(default_factory=list)
    description: str = ""


class GeneratedEducation(BaseModel):
    degree: str = ""
    school: str = ""
    dates: str = ""


class GeneratedContent(BaseModel):
    headline: str = ""
    summary: str = ""
    skills: dict[str, list[str]] = Field(default_factory=dict)
    experience: list[GeneratedExperience] = Field(default_factory=list)
    projects: list[GeneratedProject] = Field(default_factory=list)
    education: list[GeneratedEducation] = Field(default_factory=list)


class MarketInsights(BaseModel):
    in_demand_skills: list[str] = Field(default_factory=list)
    ats_keywords: list[str] = Field(default_factory=list)
    missing_skills: list[str] = Field(default_factory=list)
    sources: list[str] = Field(default_factory=list)


class ScoreBreakdown(BaseModel):
    ats_compatibility: int = 85
    impact_quantification: int = 80
    skill_relevance: int = 85
    executive_polish: int = 90
    strengths: list[str] = Field(default_factory=list)
    improvements: list[str] = Field(default_factory=list)


class GenerateResponse(BaseModel):
    strategy: ResumeStrategy
    market: MarketInsights
    content: GeneratedContent
    industry_score: int = 85
    score_breakdown: ScoreBreakdown = Field(default_factory=ScoreBreakdown)
    model: str = ""
    grounded: bool = False

