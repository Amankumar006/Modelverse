# ABot-World: Real-Time Interactive World Simulation

## Model Overview
**ABot-World** is a real-time interactive world simulator developed by **Alibaba AMAP CV Lab** (Fan Jiang, Zhaoxu Sun, et al.). Built around a 5-billion parameter causal video world model (`ABot-World-0-5B-LF`) fine-tuned from **Wan2.2-TI2V-5B**, it enables open-ended, closed-loop, action-conditioned video generation.

The model runs in real time at **720p resolution @ 16 FPS** on a single consumer-grade **NVIDIA RTX 5090 GPU**, achieving ~1.2s latency and using ~19 GB VRAM. It introduces a novel training technique called **LongForcing** to enable infinite rollouts without autoregressive drift or scene degradation.

---

## Key Features
- **Infinite Interactive Rollout (LongForcing):** Uses a student-teacher distillation strategy to align long student self-rollouts with an extended-horizon teacher, allowing continuous generation for over an hour without scene lock-in.
- **Consumer Hardware Execution:** Optimized for a single NVIDIA RTX 5090 GPU (720p @ 16 FPS, ~1.2s latency, ~19 GB VRAM).
- **Causal 5B Architecture:** Fine-tuned from Wan2.2-TI2V-5B for continuous causal rollout.
- **Closed-Loop Action Control:** Responds dynamically to real-time keyboard inputs for camera movement and roaming.
- **Unified Video & 3DGS Synthesis:** Integrates real-time video generation with 3D Gaussian Splatting for explorable 3D environments.

---

## Verified Project Links
- **Project Website:** [https://abot-world.amap.com/plaza](https://abot-world.amap.com/plaza)
- **arXiv Paper:** [https://arxiv.org/abs/2607.19191](https://arxiv.org/abs/2607.19191)
- **GitHub Repository:** [https://github.com/amap-cvlab/ABot-World](https://github.com/amap-cvlab/ABot-World)
- **Hugging Face Model:** [https://huggingface.co/acvlab/ABot-World-0-5B-LF](https://huggingface.co/acvlab/ABot-World-0-5B-LF)

---

## Benchmarks & Evaluation
- **WorldRoamBench:** Benchmark evaluating open-ended action controllability, trajectory tracking, visual quality, physical plausibility, and long-horizon temporal memory.
