"""Retrieval-Augmented Generation (RAG) Knowledge Engine for grounding interview questions and rubric evaluations.

Ingests domain knowledge guides, performs sliding-window chunking, generates term-vector
embeddings, and retrieves relevant technical context chunks for prompt generation.
"""
from __future__ import annotations

import math
import re
from dataclasses import dataclass, field
from typing import Any


def _tokenize(text: str) -> list[str]:
    """Extract normalized alphanumeric tokens from text."""
    return re.findall(r"\b[a-zA-Z0-9_]+\b", text.lower())


def _compute_tf(tokens: list[str]) -> dict[str, float]:
    """Compute term frequencies for a list of tokens."""
    if not tokens:
        return {}
    counts: dict[str, int] = {}
    for t in tokens:
        counts[t] = counts.get(t, 0) + 1
    total = len(tokens)
    return {k: v / total for k, v in counts.items()}


def _cosine_similarity(vec1: dict[str, float], vec2: dict[str, float]) -> float:
    """Compute cosine similarity between two term frequency dictionaries."""
    if not vec1 or not vec2:
        return 0.0
    common_terms = set(vec1.keys()) & set(vec2.keys())
    if not common_terms:
        return 0.0
    dot_product = sum(vec1[term] * vec2[term] for term in common_terms)
    norm1 = math.sqrt(sum(v * v for v in vec1.values()))
    norm2 = math.sqrt(sum(v * v for v in vec2.values()))
    if norm1 == 0.0 or norm2 == 0.0:
        return 0.0
    return dot_product / (norm1 * norm2)


@dataclass
class KnowledgeChunk:
    chunk_id: str
    title: str
    topic: str
    content: str
    tf_vector: dict[str, float] = field(default_factory=dict)


class RAGKnowledgeEngine:
    def __init__(self) -> None:
        self.chunks: list[KnowledgeChunk] = []
        self._seed_default_knowledge_base()

    def ingest_document(self, title: str, content: str, topic: str = "general", chunk_size: int = 400) -> int:
        """Chunk document text with sliding window and index into knowledge base."""
        words = content.split()
        added_chunks = 0

        if not words:
            return 0

        for i in range(0, len(words), chunk_size // 2):
            chunk_words = words[i : i + chunk_size]
            if not chunk_words:
                break
            chunk_text = " ".join(chunk_words)
            tokens = _tokenize(chunk_text)
            tf_vec = _compute_tf(tokens)

            chunk = KnowledgeChunk(
                chunk_id=f"{topic}_{len(self.chunks) + 1}",
                title=title,
                topic=topic.lower().strip(),
                content=chunk_text,
                tf_vector=tf_vec,
            )
            self.chunks.append(chunk)
            added_chunks += 1

            if i + chunk_size >= len(words):
                break

        return added_chunks

    def retrieve_context(self, query: str, topic: str | None = None, top_k: int = 3) -> list[dict[str, Any]]:
        """Retrieve top_k most relevant knowledge chunks matching query and optional topic."""
        query_tokens = _tokenize(query)
        query_vec = _compute_tf(query_tokens)

        if not query_vec or not self.chunks:
            return []

        scored_chunks: list[tuple[float, KnowledgeChunk]] = []

        for chunk in self.chunks:
            if topic and topic.lower() not in chunk.topic and chunk.topic not in topic.lower():
                # Allow topic mismatch with slight penalty
                score = _cosine_similarity(query_vec, chunk.tf_vector) * 0.6
            else:
                score = _cosine_similarity(query_vec, chunk.tf_vector)

            if score > 0.01:
                scored_chunks.append((score, chunk))

        scored_chunks.sort(key=lambda x: x[0], reverse=True)

        return [
            {
                "chunk_id": chunk.chunk_id,
                "title": chunk.title,
                "topic": chunk.topic,
                "score": round(score, 4),
                "content": chunk.content,
            }
            for score, chunk in scored_chunks[:top_k]
        ]

    def _seed_default_knowledge_base(self) -> None:
        """Pre-seed industry standard technical interview concepts."""
        system_design_doc = (
            "System Design Principles: Scalability, Caching, Database Partitioning, and Load Balancing. "
            "When designing high-throughput web applications, use Redis or Memcached for in-memory caching to reduce database read pressure. "
            "Database sharding involves horizontal partitioning of database rows across multiple server nodes based on a shard key. "
            "Load balancing distributes incoming traffic across application instances using Round Robin, Least Connections, or Consistent Hashing. "
            "The CAP Theorem states that a distributed system can simultaneously provide at most two out of three guarantees: Consistency, Availability, and Partition Tolerance."
        )

        dsa_doc = (
            "Data Structures and Algorithmic Complexity: Arrays, Hash Tables, Trees, Graphs, and Dynamic Programming. "
            "Hash tables offer average O(1) time complexity for lookup, insertion, and deletion. "
            "Binary Search operates on sorted arrays in O(log N) time by repeatedly halving the search range. "
            "Graph traversal techniques include Breadth-First Search (BFS) for shortest paths in unweighted graphs, and Depth-First Search (DFS) for backtracking and topological sorting. "
            "Dynamic Programming optimizes recursive problems with overlapping subproblems using memoization or bottom-up tabulation."
        )

        behavioral_doc = (
            "Behavioral Interview Framework: STAR Technique (Situation, Task, Action, Result). "
            "Candidates should structure responses by defining the specific background situation, explaining their task or core responsibility, "
            "detailing the concrete actions they personally implemented, and concluding with measurable outcomes, quantitative metrics, or key lessons learned. "
            "When handling engineering disagreements, emphasize active listening, objective data-driven benchmarks, trade-off evaluation, and team consensus."
        )

        self.ingest_document("System Design Fundamentals", system_design_doc, topic="system_design")
        self.ingest_document("Data Structures & Algorithms", dsa_doc, topic="technical")
        self.ingest_document("STAR Behavioral Framework", behavioral_doc, topic="behavioral")


# Global singleton instance
rag_engine = RAGKnowledgeEngine()
