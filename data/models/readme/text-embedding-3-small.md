# text-embedding-3-small: OpenAI's Efficient Embedding Model

## Model Overview
**text-embedding-3-small** is OpenAI's efficient text embedding model, released in January 2024 alongside text-embedding-3-large. Designed as the cost-optimized alternative for applications where speed and economy are priorities, it produces 1536-dimensional embeddings with significantly improved performance over the legacy Ada-002 model at a fraction of the cost. Like its larger sibling, it supports flexible dimension reduction without significant accuracy loss.

---

## ✨ Key Features

| Feature | Description |
|:---|:---|
| **1536 Dimensions** | Compact but expressive embedding space |
| **Flexible Dimensions** | Supports shortening to any dimension ≤1536 via `dimensions` parameter |
| **Cost-Optimized** | 5x cheaper than Ada-002 with better performance |
| **MTEB Improvement** | 44.0% on MTEB vs. Ada-002's 31.4% |
| **Fast Inference** | Lower latency than text-embedding-3-large |

---

## 📊 Benchmarks

| Benchmark | text-embedding-3-small | text-embedding-ada-002 |
|:---|:---:|:---:|
| MTEB Overall | 44.0% | 31.4% |

---

## 🔗 Resources

| Resource | Link |
|:---|:---|
| **API Docs** | [platform.openai.com/docs/guides/embeddings](https://platform.openai.com/docs/guides/embeddings) |

---

## 📜 License & Access

**Proprietary** — Available via OpenAI API.
