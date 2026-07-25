# Microsoft Phi-4: Efficient Small Language Model

## Model Overview
**Phi-4** is Microsoft Research's 14-billion parameter small language model released in December 2024. Phi-4 achieves state-of-the-art performance among models in its size class on reasoning and math benchmarks, notably outperforming significantly larger models on STEM tasks. It demonstrates that careful data curation and synthetic training data can produce highly capable compact models, continuing the Phi model family's focus on "small but mighty" reasoning-oriented language models.

---

## ✨ Key Features

| Feature | Description |
|:---|:---|
| **14B Parameters** | Small-scale model punching above its weight class on reasoning and STEM tasks |
| **Synthetic Training** | Extensively uses high-quality synthetic data for improved reasoning capabilities |
| **State-of-the-Art Math** | Beats significantly larger models on math benchmarks (MATH, AMC, AIME) |
| **Data Quality Focus** | Training data prioritizes quality over quantity, filtering for educational value |
| **Open Weights** | Released on HuggingFace under MIT license |

---

## 📊 Benchmarks

| Benchmark | Phi-4 (14B) | GPT-4o-mini |
|:---|:---:|:---:|
| MMLU | 84.8% | 82.0% |
| MATH | 80.4% | 70.2% |
| GPQA Diamond | 56.1% | 40.2% |
| HumanEval | 82.6% | 87.2% |

---

## 🔗 Resources

| Resource | Link |
|:---|:---|
| **HuggingFace** | [microsoft/phi-4](https://huggingface.co/microsoft/phi-4) |
| **Technical Report** | [arXiv:2412.08905](https://arxiv.org/abs/2412.08905) |

---

## 📜 License

**MIT License** — Fully open-source and free for commercial use.
