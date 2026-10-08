"""Security suite unit tests: testing code execution sandboxing, timeout limits,
and binary magic header upload validation.
"""
from __future__ import annotations

# pyrefly: ignore [missing-import]
import pytest
from app.core.code_executor import CodeExecutor
from app.core.storage import validate_file
from app.ai.resume_analyzer import validate_upload

RESUME_TYPES = {
    "application/pdf": ".pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
}


def test_code_executor_normal_execution():
    """Verify normal code execution completes cleanly and captures stdout."""
    res = CodeExecutor.execute_python("print('Security Test OK')")
    assert res.exit_code == 0
    assert "Security Test OK" in res.stdout
    assert not res.timed_out


def test_code_executor_timeout_limit():
    """Verify runaway infinite loop code is terminated by execution timeout bounds."""
    infinite_loop_code = "import time\nwhile True:\n    time.sleep(0.1)"
    res = CodeExecutor.execute_python(infinite_loop_code, timeout=1.0)
    assert res.timed_out is True
    assert "timed out" in res.stderr.lower() or "limit exceeded" in res.stderr.lower()


def test_validate_file_valid_pdf_magic_header():
    """Verify PDF with valid magic header %PDF- passes validation."""
    valid_pdf_bytes = b"%PDF-1.5\n%hello pdf data content..."
    ext = validate_file("application/pdf", len(valid_pdf_bytes), RESUME_TYPES, data=valid_pdf_bytes)
    assert ext == ".pdf"


def test_validate_file_invalid_spoofed_pdf_magic_header():
    """Verify spoofed executable file masquerading as PDF fails validation."""
    spoofed_bytes = b"MZ\x90\x00\x03\x00\x00\x00"  # Windows Executable binary header
    with pytest.raises(ValueError, match="Invalid PDF file signature"):
        validate_file("application/pdf", len(spoofed_bytes), RESUME_TYPES, data=spoofed_bytes)


def test_validate_upload_invalid_docx_signature():
    """Verify spoofed file disguised as DOCX is rejected in resume_analyzer."""
    invalid_docx_bytes = b"NOT_A_ZIP_HEADER"
    with pytest.raises(ValueError, match="Invalid DOCX file signature"):
        validate_upload("application/vnd.openxmlformats-officedocument.wordprocessingml.document", len(invalid_docx_bytes), "resume.docx", data=invalid_docx_bytes)
