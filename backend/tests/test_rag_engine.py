"""Unit tests for Phase 4c RAG Knowledge Base and grounded context generation."""
from __future__ import annotations

import pytest

from app.ai.context_builder import build_evaluation_context, build_question_context
from app.ai.rag_engine import RAGKnowledgeEngine, rag_engine


def test_rag_engine_preseeded_documents():
    """Verify that default industry knowledge base documents are pre-seeded."""
    assert len(rag_engine.chunks) > 0
    topics = {chunk.topic for chunk in rag_engine.chunks}
    assert "system_design" in topics or "technical" in topics or "behavioral" in topics


def test_rag_engine_custom_ingestion():
    """Verify document chunking and vector indexing for custom knowledge documents."""
    engine = RAGKnowledgeEngine()
    initial_count = len(engine.chunks)

    doc_text = (
        "Kubernetes Container Orchestration Fundamentals. "
        "Pods are the smallest deployable units of computing that you can create and manage in Kubernetes. "
        "A Service is an abstract way to expose an application running on a set of Pods as a network service. "
        "Ingress manages external access to the services in a cluster, typically HTTP."
    )
    chunks_added = engine.ingest_document("Kubernetes Guide", doc_text, topic="devops")

    assert chunks_added > 0
    assert len(engine.chunks) == initial_count + chunks_added

    # Test similarity retrieval
    results = engine.retrieve_context("What is a Kubernetes Pod?", topic="devops", top_k=2)
    assert len(results) > 0
    assert any("Kubernetes" in r["content"] for r in results)


def test_context_builder_includes_rag_knowledge():
    """Verify that context_builder incorporates retrieved RAG knowledge chunks into LLM context."""
    q_context = build_question_context(
        role="Senior Backend Engineer",
        interview_type="system_design",
        difficulty="hard",
        turn_number=1,
    )
    assert "Retrieved Authoritative Domain Knowledge:" in q_context

    eval_context = build_evaluation_context(
        role="Backend Engineer",
        difficulty="medium",
        question="Explain how Redis caching reduces database read pressure.",
        answer="Redis acts as an in-memory cache layer in front of PostgreSQL.",
        topic="system_design",
    )
    assert "Retrieved Reference Standard Concepts:" in eval_context
