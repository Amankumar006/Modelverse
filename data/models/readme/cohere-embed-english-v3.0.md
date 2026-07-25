# Embed English v3.0: Cohere's Text Embedding Model

## Model Overview
**Embed English v3.0** is Cohere's flagship text embedding model for the English language, released in November 2023. It produces dense vector representations of text optimized for semantic search, retrieval, clustering, and classification tasks. Embed v3.0 introduces a novel training approach that produces embeddings capturing both semantic similarity and relevance signal, making it particularly effective for RAG (retrieval-augmented generation) pipelines and enterprise search applications.

---

## ✨ Key Features

| Feature | Description |
|:---|:---|
| **Optimized for RAG** | Embeddings specifically tuned for retrieval quality in RAG pipelines |
| **Compressed Embeddings** | Supports int8 and binary compression for 4x-32x storage reduction |
| **Input Types** | Supports `search_document`, `search_query`, `classification`, `clustering` input types |
| **1024 Dimensions** | Dense 1024-dimensional embedding space |
| **MTEB Performance** | State-of-the-art on Massive Text Embedding Benchmark at release |

---

## 📊 Benchmarks (MTEB)

| Task Type | Score |
|:---|:---:|
| Retrieval (BEIR avg.) | State-of-the-art at release (Nov 2023) |
| Classification | Top performance |
| Clustering | Competitive with top models |

---

## 🔗 Resources

| Resource | Link |
|:---|:---|
| **API Docs** | [cohere.com/embed](https://cohere.com/embed) |
| **Blog** | [Cohere Embed v3](https://cohere.com/blog/introducing-embed-v3) |

---

## 📜 License & Access

**Proprietary** — Available via Cohere API with a free tier.
