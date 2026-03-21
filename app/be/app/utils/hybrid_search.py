"""Hybrid text search engine using LangChain + ChromaDB.

Uses ``langchain_chroma.Chroma`` with OpenAI ``text-embedding-3-small``
for dense embeddings.  Supports single-query similarity search and
multi-query Reciprocal Rank Fusion (RRF) for hybrid retrieval.
"""

from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path

from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_core.embeddings import Embeddings


def _default_embeddings(api_key: str | None = None) -> Embeddings:
    """OpenAI text-embedding-3-small.

    Uses the provided *api_key*, or falls back to the ``OPENAI_API_KEY``
    environment variable (set by dotenv at app startup).
    """
    from langchain_openai import OpenAIEmbeddings

    kwargs: dict = {"model": "text-embedding-3-small"}
    if api_key:
        kwargs["api_key"] = api_key
    return OpenAIEmbeddings(**kwargs)


class HybridSearch:
    """End-to-end hybrid text search backed by LangChain + ChromaDB.

    Workflow:
        1. Instantiate with a collection name and optional persist directory.
        2. Call ``ingest()`` to load metadata JSON into the vector store.
        3. Call ``search(query)`` to run similarity retrieval.
    """

    def __init__(
        self,
        collection_name: str = "object_labels",
        persist_directory: str | Path | None = None,
        embedding_function: Embeddings | None = None,
        openai_api_key: str | None = None,
    ) -> None:
        self._embedding_function = embedding_function or _default_embeddings(
            api_key=openai_api_key
        )

        kwargs: dict = {
            "collection_name": collection_name,
            "embedding_function": self._embedding_function,
            "collection_metadata": {"hnsw:space": "cosine"},
        }
        if persist_directory:
            kwargs["persist_directory"] = str(persist_directory)

        self._vectorstore = Chroma(**kwargs)

    # ------------------------------------------------------------------
    # Ingestion
    # ------------------------------------------------------------------

    def ingest(self, metadata_path: str | Path) -> int:
        """Load records from *metadata_path* (JSON array) into the store.

        Each record must have ``word_en`` and ``internal_id`` keys.
        Returns the number of documents added.
        """
        with open(metadata_path) as fh:
            records: list[dict] = json.load(fh)

        if not records:
            return 0

        documents: list[Document] = []
        ids: list[str] = []

        for idx, rec in enumerate(records):
            documents.append(
                Document(
                    page_content=rec["word_en"],
                    metadata={"internal_id": rec["internal_id"]},
                )
            )
            ids.append(f"obj_{idx}")

        self._vectorstore.add_documents(documents=documents, ids=ids)
        return len(documents)

    # ------------------------------------------------------------------
    # Search
    # ------------------------------------------------------------------

    def search(
        self,
        query: str,
        n_results: int = 5,
    ) -> list[Document]:
        """Similarity search against the local ChromaDB collection.

        Returns a list of LangChain ``Document`` objects.
        """
        return self._vectorstore.similarity_search(query, k=n_results)

    def hybrid_search(
        self,
        queries: list[str],
        n_results: int = 5,
        weights: list[float] | None = None,
        rrf_k: int = 60,
    ) -> list[Document]:
        """Multi-query search with Reciprocal Rank Fusion.

        Each query in *queries* is run independently; the per-query
        ranked lists are fused using RRF.
        """
        if weights is None:
            weights = [1.0] * len(queries)

        fetch_k = max(n_results * 3, 20)

        rrf_scores: dict[str, float] = defaultdict(float)
        doc_map: dict[str, Document] = {}

        for q, w in zip(queries, weights):
            docs = self._vectorstore.similarity_search(q, k=fetch_k)
            for rank, doc in enumerate(docs, start=1):
                key = doc.page_content
                rrf_scores[key] += w / (rrf_k + rank)
                doc_map[key] = doc

        ranked = sorted(rrf_scores, key=rrf_scores.get, reverse=True)
        return [doc_map[k] for k in ranked[:n_results]]

    # ------------------------------------------------------------------
    # Utilities
    # ------------------------------------------------------------------

    @property
    def count(self) -> int:
        """Number of documents in the collection."""
        collection = self._vectorstore._collection
        return collection.count() if collection else 0

    @property
    def vectorstore(self) -> Chroma:
        """Expose the underlying LangChain Chroma store."""
        return self._vectorstore

    def as_retriever(self, **kwargs):
        """Return a LangChain retriever for use in chains / agents."""
        return self._vectorstore.as_retriever(**kwargs)

    def clear(self) -> None:
        """Delete all documents from the collection."""
        collection = self._vectorstore._collection
        if collection and collection.count() > 0:
            all_ids = self._vectorstore.get()["ids"]
            if all_ids:
                self._vectorstore.delete(ids=all_ids)

    def delete_collection(self) -> None:
        """Permanently delete the underlying collection."""
        self._vectorstore.delete_collection()
