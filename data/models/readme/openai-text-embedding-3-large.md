# Text Embedding 3 Large: OpenAI's Best Embedding Model

## Model Overview
**text-embedding-3-large** is OpenAI's most capable text embedding model, released in January 2024. It produces 3072-dimensional embeddings with significantly improved performance over the previous Ada-002 embedding model — achieving 54.9% on MTEB (Multilingual Text Embedding Benchmark) versus Ada-002's 31.4%. It supports shortening embeddings to reduce storage/computation costs without significant performance loss.

---

## ✨ Key Features

| Feature | Description |
|:---|:---|
| **3072 Dimensions** | High-dimensional embeddings for maximum semantic richness |
| **Flexible Dimensions** | Supports reducing to any dimension ≤3072 via `dimensions` parameter |
| **MTEB Performance** | 54.9% on MTEB — 75% improvement over text-embedding-ada-002 |
| **Multilingual** | Strong multilingual embedding performance across many languages |
| **Cost-Effective** | Significantly cheaper than Ada-002 per token |

---

## 📊 Benchmarks

| Benchmark | text-embedding-3-large | text-embedding-ada-002 |
|:---|:---:|:---:|
| MTEB Overall | 54.9% | 31.4% |
| Avg Retrieval (BEIR) | 54.9% | 49.3% |

---

## 🔗 Resources

| Resource | Link |
|:---|:---|
| **API Docs** | [platform.openai.com/docs/guides/embeddings](https://platform.openai.com/docs/guides/embeddings) |
| **Announcement** | [OpenAI Blog](https://openai.com/blog/new-embedding-models-and-api-updates) |

---

## 📜 License & Access

**Proprietary** — Available via OpenAI API.
