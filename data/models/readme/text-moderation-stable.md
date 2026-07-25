# text-moderation-stable: OpenAI's Stable Moderation Model

## Model Overview
**text-moderation-stable** is OpenAI's pinned, stable version of their content moderation API model. It classifies text content into harmful categories — including violence, self-harm, sexual content, harassment, and hate speech — and returns per-category scores along with an overall flagged verdict. The `-stable` variant ensures consistent behavior over time without automatic updates, making it suitable for production applications that require reproducible moderation results.

---

## ✨ Key Features

| Feature | Description |
|:---|:---|
| **Stable Version** | Pinned to a fixed version to ensure consistent behavior over time |
| **Multi-Category** | Classifies across violence, self-harm, sexual, harassment, hate, and more |
| **Per-Category Scores** | Returns probability scores for each harm category individually |
| **Free API** | The moderation endpoint is free to use via the OpenAI API |
| **Fast Inference** | Optimized for high-throughput content moderation at scale |

---

## 🔗 Resources

| Resource | Link |
|:---|:---|
| **API Docs** | [platform.openai.com/docs/guides/moderation](https://platform.openai.com/docs/guides/moderation) |

---

## 📜 License & Access

**Proprietary (Free)** — Free to use via OpenAI API for moderation purposes.
