"""Unit tests for complete resume data extraction schema and file validation."""
from __future__ import annotations

import pytest
from app.ai.resume_analyzer import EXTRACTION_SCHEMA_HINT, validate_upload


def test_extraction_schema_hint_contains_full_profile_fields():
    """Verify EXTRACTION_SCHEMA_HINT requests all detailed candidate profile fields."""
    assert "toolsAndFrameworks" in EXTRACTION_SCHEMA_HINT
    assert "languages" in EXTRACTION_SCHEMA_HINT
    assert "fieldOfStudy" in EXTRACTION_SCHEMA_HINT
    assert "bullets" in EXTRACTION_SCHEMA_HINT
    assert "gpa" in EXTRACTION_SCHEMA_HINT
    assert "link" in EXTRACTION_SCHEMA_HINT


def test_validate_upload_pdf():
    """Verify PDF upload validation with valid magic header."""
    data = b"%PDF-1.7\nSample resume text..."
    mime = validate_upload("application/pdf", len(data), "sample.pdf", data=data)
    assert mime == "application/pdf"


def test_validate_upload_docx():
    """Verify DOCX upload validation with valid PK zip header."""
    data = b"PK\x03\x04\x14\x00\x00\x00Sample docx text..."
    mime = validate_upload("application/vnd.openxmlformats-officedocument.wordprocessingml.document", len(data), "sample.docx", data=data)
    assert mime == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"


def test_fallback_extract_college_name_and_skills():
    """Verify _fallback_extract parses candidate name, university, degree, contact details, and skills from plain text."""
    from app.ai.resume_analyzer import _fallback_extract
    sample_text = (
        "John Doe\n"
        "john.doe@example.com | (555) 123-4567 | linkedin.com/in/johndoe\n"
        "Technical Skills\n"
        "Python, React, TypeScript, Node.js, SQL, FastApi\n"
        "Education\n"
        "Bachelor of Science in Computer Science\n"
        "Stanford University 2023\n"
    )
    result = _fallback_extract(sample_text)
    assert result["personalInfo"]["fullName"] == "John Doe"
    assert result["personalInfo"]["email"] == "john.doe@example.com"
    assert "linkedin.com/in/johndoe" in (result["personalInfo"]["linkedin"] or "")
    assert len(result["skills"]) > 0
    assert len(result["education"]) > 0
    assert any("Stanford University" in edu["school"] or "Stanford" in edu["school"] for edu in result["education"])

