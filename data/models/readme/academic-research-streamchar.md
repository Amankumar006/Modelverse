# StreamChar

## Model Overview
**StreamChar** is a **undisclosed-parameter** model developed by **Alibaba**.
Released on **2026-05-25**.

---

## 📊 Quick Specs

| Specification | Value |
|:---|:---|
| **Parameters** | undisclosed |
| **Task** | video-generation |
| **Modality** | text, audio, video |
| **License** | Other/Custom |
| **Type** | research-preview |

---

## ✨ Key Features

- Decoupled Orchestration Architecture: Separates global semantic planning (LLM orchestrator) from local short-window audio-video DiT
- Progress-Aware Pointer: Maps transcript text directly to continuous audio and video generation, preventing speech-text drift
- Sink-Chunk Memory Mechanism: Employs persistent visual anchors ('sink chunks') to eliminate identity and quality drift
- Two-Stage Decoupled Distillation: Combines DMD step-compression with online chunk rollout fine-tuning for low latency
- Real-Time Single-GPU Streaming: Continuous streaming inference on a single NVIDIA H100 GPU (1.34s latency per 33-frame chunk)

---

## 🔗 Resources

- **Hugging Face**: [StreamChar](https://huggingface.co/papers/2605.25659)
- **GitHub**: [Repository](https://github.com/HumanAIGC/StreamChar)
- **Paper**: [arXiv](https://arxiv.org/abs/2605.25659)
- **Website**: [Project Page](https://humanaigc.github.io/StreamChar_page/)

---

## 📜 License & Access
**Other/Custom** — See repository for specific license details.
