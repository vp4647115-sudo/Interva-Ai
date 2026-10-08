"""Local Speech-to-Text service using Whisper.

Downloads and caches the model in backend/models/.
Thread-safe for concurrent requests.
"""
from __future__ import annotations

import asyncio
import logging
import os
import threading
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

# Model path and lock for thread-safe loading
MODEL_DIR = Path(__file__).resolve().parents[2] / "models"
MODEL_LOCK = threading.Lock()
_MODEL: Optional[object] = None  # Will be whisper.Whisper when loaded


def _ensure_model_dir() -> None:
    """Create models directory if it doesn't exist."""
    MODEL_DIR.mkdir(parents=True, exist_ok=True)


def get_model(model_name: str = "tiny") -> object:
    """Load and cache the Whisper model (thread-safe singleton)."""
    global _MODEL
    if _MODEL is not None:
        return _MODEL

    with MODEL_LOCK:
        if _MODEL is not None:  # Double-check after acquiring lock
            return _MODEL

        import whisper

        _ensure_model_dir()
        logger.info(f"Loading Whisper model: {model_name}")
        _MODEL = whisper.load_model(model_name, download_root=str(MODEL_DIR))
        logger.info(f"Whisper model '{model_name}' loaded successfully")
        return _MODEL


def transcribe_audio(file_path: Path, language: str = "en") -> str:
    """Transcribe an audio file using Whisper.

    Args:
        file_path: Path to the audio file (WAV, MP3, etc.)
        language: Language code (default: 'en')

    Returns:
        Transcribed text string
    """
    model = get_model()
    logger.info(f"Transcribing: {file_path}")

    result = model.transcribe(str(file_path), language=language, verbose=False)
    text = result.get("text", "").strip()
    logger.info(f"Transcription complete: {len(text)} chars")
    return text


async def transcribe_audio_async(file_path: Path, language: str = "en") -> str:
    """Async wrapper for transcribe_audio (runs in thread pool)."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, transcribe_audio, file_path, language)