# StreamChar

## 📌 Model Overview

StreamChar is a real-time, long-horizon streaming framework for generating synchronized audio and video of talking characters from text transcripts developed by Alibaba Tongyi Lab (HumanAIGC Team). It decouples long-horizon orchestration from short-window audio-video denoising using a Joint Audio-Video Diffusion Transformer (DiT).

**StreamChar** is a **Research Preview** model developed by **Alibaba**, released on **2026-05-25**. It is engineered primarily for **Video Generation** workloads. Featuring a **128K tokens** context window and **Undisclosed** parameter count, it offers robust performance for enterprise integration, developers, and researchers.

---

## ✨ Key Features & Capabilities

| Feature | Description |
|:---|:---|
| **Context Window** | 128K tokens capacity for extended prompts and multi-turn workflows |
| **Primary Task** | Optimized for Video Generation |
| **Deployment** | self-hostable |
| **Modality** | text, audio, video |
| **Decoupled Orchestration Architecture** | Decoupled Orchestration Architecture: Separates global semantic planning (LLM orchestrator) from local short-window audio-video DiT |
| **Progress-Aware Pointer** | Progress-Aware Pointer: Maps transcript text directly to continuous audio and video generation, preventing speech-text drift |
| **Sink-Chunk Memory Mechanism** | Sink-Chunk Memory Mechanism: Employs persistent visual anchors ('sink chunks') to eliminate identity and quality drift |
| **Two-Stage Decoupled Distillation** | Two-Stage Decoupled Distillation: Combines DMD step-compression with online chunk rollout fine-tuning for low latency |
| **Real-Time Single-GPU Streaming** | Real-Time Single-GPU Streaming: Continuous streaming inference on a single NVIDIA H100 GPU (1.34s latency per 33-frame chunk) |

---

## ⚙️ Technical Specifications

| Specification | Details |
|:---|:---|
| **Developer / Lab** | Alibaba |
| **Release Date** | 2026-05-25 |
| **Model Type** | Research Preview |
| **Parameters** | Undisclosed |
| **Context Window** | 128K tokens |
| **License** | Apache-2.0 |

---

## 📊 Benchmarks & Performance

| Benchmark | Score | Source |
|:---|:---:|:---|
| **FID (Fréchet Inception Distance)** | `17.99` | Independent Eval |
| **Word Error Rate (WER)** | `3.54%` | Independent Eval |
| **VBench Dynamic Score** | `1.0` | Independent Eval |

---

## 🔗 Resources & Links

| Resource | Link |
|:---|:---|
| **website** | [https://humanaigc.github.io/StreamChar_page/](https://humanaigc.github.io/StreamChar_page/) |
| **paper** | [https://arxiv.org/abs/2605.25659](https://arxiv.org/abs/2605.25659) |
| **github** | [https://github.com/HumanAIGC/StreamChar](https://github.com/HumanAIGC/StreamChar) |
| **huggingface** | [https://huggingface.co/papers/2605.25659](https://huggingface.co/papers/2605.25659) |

---

## 📜 License & Usage

This model is governed by the **Apache-2.0** license. Please check official developer guidelines before commercial deployment.
